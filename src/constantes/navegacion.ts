export type ItemNavegacion = {
  etiqueta: string;
  ruta: string;
  soloAdmin: boolean;
};

// El EMPLEADO solo accede a Dashboard, Productos, Stock, Proveedores y Pedidos.
export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: "/dashboard", soloAdmin: false },
  { etiqueta: "Productos", ruta: "/productos", soloAdmin: false },
  { etiqueta: "Categorías", ruta: "/categorias", soloAdmin: true },
  { etiqueta: "Proveedores", ruta: "/proveedores", soloAdmin: false },
  { etiqueta: "Stock", ruta: "/stock", soloAdmin: false },
  { etiqueta: "Movimientos", ruta: "/movimientos", soloAdmin: true },
  { etiqueta: "Pedidos", ruta: "/pedidos", soloAdmin: false },
  { etiqueta: "Clientes", ruta: "/clientes", soloAdmin: true },
  { etiqueta: "Reportes", ruta: "/reportes", soloAdmin: true },
  { etiqueta: "Empleados", ruta: "/empleados", soloAdmin: true },
  { etiqueta: "Configuración", ruta: "/configuracion", soloAdmin: true },
  { etiqueta: "Auditoría", ruta: "/auditoria", soloAdmin: true },
];
