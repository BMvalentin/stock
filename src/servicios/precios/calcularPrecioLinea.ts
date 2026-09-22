import type { TipoPrecio } from "@/generated/prisma/enums";

// Regla de precio ya resuelta a números, lista para calcular. Es la forma en la
// que los servicios entregan las reglas al motor puro (sin Prisma).
export type ReglaPrecioResoluble = {
  id: string;
  // null = regla genérica (aplica a cualquier método de pago).
  metodoPagoId: string | null;
  cantidadDesde: number;
  cantidadHasta: number | null;
  tipoPrecio: TipoPrecio;
  precio: number;
  prioridad: number;
};

// Pack de una promoción aplicado en la línea.
export type PackAplicado = {
  cantidad: number;
  precio: number;
  veces: number;
};

export type DesglosePrecio = {
  tipo: "UNITARIO" | "TOTAL" | "MIXTO";
  cantidad: number;
  // Cantidad cobrada al precio unitario de la escala (resto).
  cantidadUnitaria: number;
  // Precio unitario de la escala aplicada al resto (0 si no hay).
  precioUnitario: number;
  packs: PackAplicado[];
  subtotal: number;
};

export type PrecioCalculado = {
  // Precio efectivo por unidad (subtotal / cantidad), para mostrar.
  precioUnitario: number;
  subtotal: number;
  desglose: DesglosePrecio;
};

const MIL = 1000;
// Tope de seguridad para el cálculo exacto (evita DP enorme en cantidades
// absurdas). Por encima se usa el precio unitario directo.
const LIMITE_MILESIMAS = 1_000_000;

function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function buscarReglaUnitaria(
  reglas: ReglaPrecioResoluble[],
  cantidad: number,
): ReglaPrecioResoluble | null {
  const candidatas = reglas.filter(
    (regla) =>
      regla.tipoPrecio === "UNITARIO" &&
      regla.cantidadDesde <= cantidad &&
      (regla.cantidadHasta === null || cantidad <= regla.cantidadHasta),
  );

  if (candidatas.length === 0) return null;

  // El tramo más específico: mayor `cantidadDesde` y, a igualdad, menor `hasta`.
  candidatas.sort(
    (a, b) =>
      b.cantidadDesde - a.cantidadDesde ||
      (a.cantidadHasta ?? Infinity) - (b.cantidadHasta ?? Infinity),
  );

  return candidatas[0];
}

function packsAplicables(
  reglas: ReglaPrecioResoluble[],
  cantidad: number,
): ReglaPrecioResoluble[] {
  return reglas
    .filter(
      (regla) =>
        regla.tipoPrecio === "TOTAL" &&
        regla.cantidadDesde > 0 &&
        regla.cantidadDesde <= cantidad,
    )
    // Packs más grandes primero: ante igual costo se usan menos grupos.
    .sort((a, b) => b.cantidadDesde - a.cantidadDesde);
}

function calcularSoloUnitario(
  regla: ReglaPrecioResoluble,
  cantidad: number,
): PrecioCalculado {
  const subtotal = redondear2(regla.precio * cantidad);

  return {
    precioUnitario: redondear2(subtotal / cantidad),
    subtotal,
    desglose: {
      tipo: "UNITARIO",
      cantidad,
      cantidadUnitaria: cantidad,
      precioUnitario: regla.precio,
      packs: [],
      subtotal,
    },
  };
}

function calcularConPromociones(
  unidad: ReglaPrecioResoluble | null,
  packs: ReglaPrecioResoluble[],
  cantidad: number,
): PrecioCalculado | null {
  const qMil = Math.round(cantidad * MIL);

  if (qMil > LIMITE_MILESIMAS) {
    if (unidad) return calcularSoloUnitario(unidad, cantidad);

    const exacto = packs.find((pack) => pack.cantidadDesde === cantidad);

    if (!exacto) return null;

    const subtotal = redondear2(exacto.precio);

    return {
      precioUnitario: redondear2(subtotal / cantidad),
      subtotal,
      desglose: {
        tipo: "TOTAL",
        cantidad,
        cantidadUnitaria: 0,
        precioUnitario: 0,
        packs: [{ cantidad: exacto.cantidadDesde, precio: exacto.precio, veces: 1 }],
        subtotal,
      },
    };
  }

  const packsMil = packs.map((pack) => ({
    cantidad: pack.cantidadDesde,
    cantidadMil: Math.round(pack.cantidadDesde * MIL),
    precio: pack.precio,
  }));

  const unitarioPorMil = unidad === null ? null : unidad.precio / MIL;

  const costo = new Float64Array(qMil + 1);
  costo.fill(Infinity);
  // -1 = sin elección, -2 = unidad, >= 0 = índice de pack.
  const eleccion = new Int32Array(qMil + 1);
  eleccion.fill(-1);
  costo[0] = 0;

  for (let i = 1; i <= qMil; i += 1) {
    let mejor = Infinity;
    let elegido = -1;

    if (unitarioPorMil !== null) {
      const candidato = redondear2(costo[i - 1] + unitarioPorMil);
      if (candidato < mejor) {
        mejor = candidato;
        elegido = -2;
      }
    }

    for (let k = 0; k < packsMil.length; k += 1) {
      const pack = packsMil[k];

      if (pack.cantidadMil <= i) {
        const candidato = redondear2(costo[i - pack.cantidadMil] + pack.precio);
        if (candidato < mejor) {
          mejor = candidato;
          elegido = k;
        }
      }
    }

    costo[i] = mejor;
    eleccion[i] = elegido;
  }

  if (!Number.isFinite(costo[qMil])) return null;

  const veces = new Array<number>(packsMil.length).fill(0);
  let unidadesMil = 0;
  let restante = qMil;

  while (restante > 0) {
    const elegido = eleccion[restante];

    if (elegido === -2) {
      unidadesMil += 1;
      restante -= 1;
    } else if (elegido >= 0) {
      veces[elegido] += 1;
      restante -= packsMil[elegido].cantidadMil;
    } else {
      return null;
    }
  }

  const packsAplicados = packsMil
    .map((pack, indice) => ({
      cantidad: pack.cantidad,
      precio: pack.precio,
      veces: veces[indice],
    }))
    .filter((pack) => pack.veces > 0);

  const cantidadUnitaria = unidadesMil / MIL;
  const subtotal = redondear2(costo[qMil]);
  const tipo =
    packsAplicados.length === 0
      ? "UNITARIO"
      : cantidadUnitaria > 0
        ? "MIXTO"
        : "TOTAL";

  return {
    precioUnitario: redondear2(subtotal / cantidad),
    subtotal,
    desglose: {
      tipo,
      cantidad,
      cantidadUnitaria,
      precioUnitario: unidad?.precio ?? 0,
      packs: packsAplicados,
      subtotal,
    },
  };
}

function calcularConjunto(
  reglas: ReglaPrecioResoluble[],
  cantidad: number,
): PrecioCalculado | null {
  const unidad = buscarReglaUnitaria(reglas, cantidad);
  const packs = packsAplicables(reglas, cantidad);

  if (!unidad && packs.length === 0) return null;

  if (packs.length === 0) return calcularSoloUnitario(unidad as ReglaPrecioResoluble, cantidad);

  return calcularConPromociones(unidad, packs, cantidad);
}

// Resuelve el precio de una línea del pedido. Prioridad:
//   1. Reglas específicas del método de pago elegido; si no hay, genéricas.
//   2. Dentro del conjunto, la combinación más barata de promociones (`TOTAL`,
//      en múltiplos completos) más el resto al precio de la escala (`UNITARIO`).
// Devuelve `null` si no hay ninguna regla aplicable.
export function calcularPrecioLinea(
  reglas: ReglaPrecioResoluble[],
  metodoPagoId: string,
  cantidad: number,
): PrecioCalculado | null {
  if (!(cantidad > 0)) return null;

  const especificas = reglas.filter(
    (regla) => regla.metodoPagoId === metodoPagoId,
  );
  const genericas = reglas.filter((regla) => regla.metodoPagoId === null);

  // Si hay reglas específicas, se intentan primero; si no cubren la cantidad,
  // se cae a las genéricas.
  const conjuntos =
    especificas.length > 0 ? [especificas, genericas] : [genericas];

  for (const conjunto of conjuntos) {
    if (conjunto.length === 0) continue;

    const resultado = calcularConjunto(conjunto, cantidad);

    if (resultado) return resultado;
  }

  return null;
}
