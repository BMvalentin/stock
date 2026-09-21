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

// El acceso de cada ítem lo decide la política central (`puedeAcceder`), no el
// propio listado: así la navegación no puede desincronizarse de la autorización.
export const ITEMS_NAVEGACION: ItemNavegacion[] = [
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
