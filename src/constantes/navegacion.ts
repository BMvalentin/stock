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
  icono: LucideIcon;
};

// Menús por rol. Son solo cosméticos: la autorización real de cada ruta la
// aplica el servidor (layouts y Server Actions). El listado no puede dar
// acceso a una ruta protegida.
export const ITEMS_NAVEGACION_ADMIN: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: "/admin", icono: LayoutDashboard },
  { etiqueta: "Mi asistencia", ruta: "/admin/asistencia/fichar", icono: Clock },
  { etiqueta: "Fichaje QR", ruta: "/admin/asistencia/qr", icono: QrCode },
  { etiqueta: "Productos", ruta: "/admin/productos", icono: Package },
  { etiqueta: "Categorías", ruta: "/admin/categorias", icono: Tags },
  { etiqueta: "Proveedores", ruta: "/admin/proveedores", icono: Truck },
  { etiqueta: "Stock", ruta: "/admin/stock", icono: Boxes },
  { etiqueta: "Movimientos", ruta: "/admin/movimientos", icono: ArrowLeftRight },
  { etiqueta: "Pedidos", ruta: "/admin/pedidos", icono: ShoppingCart },
  { etiqueta: "Reportes", ruta: "/admin/reportes", icono: BarChart3 },
  { etiqueta: "Empleados", ruta: "/admin/empleados", icono: UserCog },
  { etiqueta: "Configuración", ruta: "/admin/configuracion", icono: Settings },
  { etiqueta: "Auditoría", ruta: "/admin/auditoria", icono: ScrollText },
];

export const ITEMS_NAVEGACION_EMPLEADO: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: "/empleado", icono: LayoutDashboard },
  { etiqueta: "Productos", ruta: "/empleado/productos", icono: Package },
  { etiqueta: "Pedidos", ruta: "/empleado/pedidos", icono: ShoppingCart },
  { etiqueta: "Fichaje QR", ruta: "/empleado/fichaje", icono: QrCode },
];

// Etiquetas legibles para las migas de pan (ruta completa -> texto).
export const ETIQUETAS_RUTA: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/productos": "Productos",
  "/admin/categorias": "Categorías",
  "/admin/proveedores": "Proveedores",
  "/admin/stock": "Stock",
  "/admin/movimientos": "Movimientos",
  "/admin/pedidos": "Pedidos",
  "/admin/reportes": "Reportes",
  "/admin/empleados": "Empleados",
  "/admin/configuracion": "Configuración",
  "/admin/auditoria": "Auditoría",
  "/admin/asistencia/fichar": "Mi asistencia",
  "/admin/asistencia/qr": "Fichaje QR",
  "/empleado": "Dashboard",
  "/empleado/productos": "Productos",
  "/empleado/pedidos": "Pedidos",
  "/empleado/fichaje": "Fichaje QR",
  nuevo: "Nuevo",
  editar: "Editar",
  asistencia: "Asistencia",
  produccion: "Producción",
  liquidacion: "Liquidaciones",
  fichar: "Fichar",
  fichaje: "Fichaje",
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
  "fichaje",
  "qr",
];
