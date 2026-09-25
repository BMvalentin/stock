import type { Prisma } from "@/generated/prisma/client";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { ModalidadEntrada, ReglaPrecioEntrada } from "@/tipos/producto";

type ModalidadActual = Prisma.ModalidadVentaGetPayload<{
  include: { reglas: true };
}>;
type ReglaActual = ModalidadActual["reglas"][number];

// Solo las reglas `UNITARIO` usan rango superior; `TOTAL` y `PRESENTACION`
// representan un conjunto/presentación cuyo tamaño es `cantidadDesde`.
function usaRangoSuperior(tipoPrecio: ReglaPrecioEntrada["tipoPrecio"]): boolean {
  return tipoPrecio === "UNITARIO";
}

function datosRegla(entrada: ReglaPrecioEntrada) {
  return {
    metodoPagoId: entrada.metodoPagoId,
    cantidadDesde: entrada.cantidadDesde,
    cantidadHasta: usaRangoSuperior(entrada.tipoPrecio)
      ? entrada.cantidadHasta
      : null,
    tipoPrecio: entrada.tipoPrecio,
    precio: entrada.precio,
    activo: entrada.activo,
  };
}

function normalizarBase(
  modalidades: ModalidadEntrada[],
): ModalidadEntrada[] {
  const indice = modalidades.findIndex((modalidad) => modalidad.esBase);
  const base = indice === -1 ? 0 : indice;

  return modalidades.map((modalidad, posicion) => ({
    ...modalidad,
    esBase: posicion === base,
  }));
}

async function reconciliarReglas(
  tx: Prisma.TransactionClient,
  productoId: string,
  modalidadId: string,
  actuales: ReglaActual[],
  entrantes: ReglaPrecioEntrada[],
  usuarioId: string,
): Promise<void> {
  const porId = new Map(actuales.map((regla) => [regla.id, regla]));
  const usados = new Set<string>();

  for (const entrada of entrantes) {
    const actual = entrada.id ? porId.get(entrada.id) : undefined;

    if (!actual) {
      await tx.reglaPrecio.create({
        data: { modalidadId, ...datosRegla(entrada) },
      });
      continue;
    }

    usados.add(actual.id);

    const precioAnterior = Number(actual.precio);
    const cambioPrecio = precioAnterior !== entrada.precio;
    const cambioConfig =
      actual.tipoPrecio !== entrada.tipoPrecio ||
      Number(actual.cantidadDesde) !== entrada.cantidadDesde ||
      (actual.cantidadHasta === null ? null : Number(actual.cantidadHasta)) !==
        entrada.cantidadHasta ||
      actual.metodoPagoId !== entrada.metodoPagoId ||
      actual.activo !== entrada.activo;

    if (!cambioPrecio && !cambioConfig) continue;

    await tx.reglaPrecio.update({
      where: { id: actual.id },
      data: datosRegla(entrada),
    });

    if (!cambioPrecio) continue;

    await tx.reglaPrecioHistorial.create({
      data: {
        productoId,
        modalidadId,
        reglaPrecioId: actual.id,
        metodoPagoId: entrada.metodoPagoId,
        tipoPrecio: entrada.tipoPrecio,
        cantidadDesde: entrada.cantidadDesde,
        cantidadHasta: usaRangoSuperior(entrada.tipoPrecio)
          ? entrada.cantidadHasta
          : null,
        precioAnterior,
        precioNuevo: entrada.precio,
        usuarioId,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PRECIO_MODIFICADO,
        entidad: "Producto",
        entidadId: productoId,
        datos: {
          modalidadId,
          metodoPagoId: entrada.metodoPagoId,
          precioAnterior,
          precioNuevo: entrada.precio,
        },
      },
      tx,
    );
  }

  const aDesactivar = actuales
    .filter((regla) => regla.activo && !usados.has(regla.id))
    .map((regla) => regla.id);

  if (aDesactivar.length > 0) {
    await tx.reglaPrecio.updateMany({
      where: { id: { in: aDesactivar } },
      data: { activo: false },
    });
  }
}

// Reconcilia las modalidades de venta y sus reglas de precio de un producto.
// Las modalidades y reglas que ya no vienen en la entrada se desactivan (baja
// lógica) para no romper el historial. Registra `ReglaPrecioHistorial` cuando
// cambia el precio de una regla existente.
export async function guardarModalidadesProducto(
  tx: Prisma.TransactionClient,
  productoId: string,
  modalidades: ModalidadEntrada[],
  usuarioId: string,
): Promise<void> {
  const normalizadas = normalizarBase(modalidades);
  const existentes = await tx.modalidadVenta.findMany({
    where: { productoId },
    include: { reglas: true },
  });
  const porId = new Map(existentes.map((modalidad) => [modalidad.id, modalidad]));
  const porNombre = new Map(
    existentes.map((modalidad) => [modalidad.nombre, modalidad]),
  );
  const usados = new Set<string>();

  for (const entrada of normalizadas) {
    const actual =
      (entrada.id ? porId.get(entrada.id) : undefined) ??
      porNombre.get(entrada.nombre);

    const datosModalidad = {
      nombre: entrada.nombre,
      unidadVenta: entrada.unidadVenta,
      contenido: entrada.contenido,
      etiquetaPresentacion: entrada.etiquetaPresentacion,
      esBase: entrada.esBase,
      activo: entrada.activo,
      orden: entrada.orden,
    };

    if (actual) {
      usados.add(actual.id);

      await tx.modalidadVenta.update({
        where: { id: actual.id },
        data: datosModalidad,
      });

      await reconciliarReglas(
        tx,
        productoId,
        actual.id,
        actual.reglas,
        entrada.reglas,
        usuarioId,
      );
      continue;
    }

    const creada = await tx.modalidadVenta.create({
      data: { productoId, ...datosModalidad },
    });

    for (const regla of entrada.reglas) {
      await tx.reglaPrecio.create({
        data: { modalidadId: creada.id, ...datosRegla(regla) },
      });
    }
  }

  const aDesactivar = existentes.filter(
    (modalidad) => modalidad.activo && !usados.has(modalidad.id),
  );

  for (const modalidad of aDesactivar) {
    await tx.modalidadVenta.update({
      where: { id: modalidad.id },
      data: { activo: false },
    });

    await tx.reglaPrecio.updateMany({
      where: { modalidadId: modalidad.id, activo: true },
      data: { activo: false },
    });
  }
}
