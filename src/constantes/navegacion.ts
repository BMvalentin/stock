import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Clock,
  LayoutDashboard,
  Package,
  QrCode,
  ScrollText,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
} from "lucide-react";

export type ItemNavegacion = {
  etiqueta: string;
  ruta: string;
  soloAdmin: boolean;
  icono: LucideIcon;
};

// El EMPLEADO solo accede a Dashboard, Productos, Stock, Proveedores, Pedidos
// y a su propio fichaje de asistencia.
export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: "/dashboard", soloAdmin: false, icono: LayoutDashboard },
  { etiqueta: "Mi asistencia", ruta: "/asistencia/fichar", soloAdmin: false, icono: Clock },
  { etiqueta: "Fichaje QR", ruta: "/asistencia/qr", soloAdmin: true, icono: QrCode },
  { etiqueta: "Productos", ruta: "/productos", soloAdmin: false, icono: Package },
  { etiqueta: "Categorías", ruta: "/categorias", soloAdmin: true, icono: Tags },
  { etiqueta: "Proveedores", ruta: "/proveedores", soloAdmin: false, icono: Truck },
  { etiqueta: "Stock", ruta: "/stock", soloAdmin: false, icono: Boxes },
  { etiqueta: "Movimientos", ruta: "/movimientos", soloAdmin: true, icono: ArrowLeftRight },
  { etiqueta: "Pedidos", ruta: "/pedidos", soloAdmin: false, icono: ShoppingCart },
  { etiqueta: "Reportes", ruta: "/reportes", soloAdmin: true, icono: BarChart3 },
  { etiqueta: "Empleados", ruta: "/empleados", soloAdmin: true, icono: UserCog },
  { etiqueta: "Configuración", ruta: "/configuracion", soloAdmin: true, icono: Settings },
  { etiqueta: "Auditoría", ruta: "/auditoria", soloAdmin: true, icono: ScrollText },
];

// Etiquetas legibles para las migas de pan (ruta completa -> texto).
export const ETIQUETAS_RUTA: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/productos": "Productos",
  "/categorias": "Categorías",
  "/proveedores": "Proveedores",
  "/stock": "Stock",
  "/movimientos": "Movimientos",
  "/pedidos": "Pedidos",
  "/reportes": "Reportes",
  "/empleados": "Empleados",
  "/configuracion": "Configuración",
  "/auditoria": "Auditoría",
  "/asistencia/fichar": "Mi asistencia",
  "/asistencia/qr": "Fichaje QR",
  nuevo: "Nuevo",
  editar: "Editar",
  asistencia: "Asistencia",
  produccion: "Producción",
  liquidacion: "Liquidaciones",
  fichar: "Fichar",
  qr: "QR",
};

// Palabras reservadas de subrutas que no representan un identificador.
export const SEGMENTOS_ESPECIALES = [
  "nuevo",
  "editar",
  "asistencia",
  "produccion",
  "liquidacion",
  "fichar",
  "qr",
];
