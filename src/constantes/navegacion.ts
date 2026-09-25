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

export type GrupoNavegacion = {
  // Sin título el grupo se renderiza plano (ítems sueltos, sin desplegable).
  titulo?: string;
  items: ItemNavegacion[];
  abiertoPorDefecto?: boolean;
};

// Menús por rol. Son solo cosméticos: la autorización real de cada ruta la
// aplica el servidor (layouts y Server Actions). El listado no puede dar
// acceso a una ruta protegida.
export const GRUPOS_NAVEGACION_ADMIN: GrupoNavegacion[] = [
  {
    items: [
      { etiqueta: "Dashboard", ruta: "/admin", icono: LayoutDashboard },
      { etiqueta: "Pedidos", ruta: "/admin/pedidos", icono: ShoppingCart },
      { etiqueta: "Productos", ruta: "/admin/productos", icono: Package },
      { etiqueta: "Stock", ruta: "/admin/stock", icono: Boxes },
    ],
  },
  {
    titulo: "Inventario",
    items: [
      { etiqueta: "Categorías", ruta: "/admin/categorias", icono: Tags },
      { etiqueta: "Movimientos", ruta: "/admin/movimientos", icono: ArrowLeftRight },
    ],
  },
  {
    titulo: "Personal",
    items: [
      { etiqueta: "Mi asistencia", ruta: "/admin/asistencia/fichar", icono: Clock },
      { etiqueta: "Fichaje QR", ruta: "/admin/asistencia/qr", icono: QrCode },
      { etiqueta: "Empleados", ruta: "/admin/empleados", icono: UserCog },
    ],
  },
  {
    titulo: "Gestión",
    items: [
      { etiqueta: "Proveedores", ruta: "/admin/proveedores", icono: Truck },
      { etiqueta: "Reportes", ruta: "/admin/reportes", icono: BarChart3 },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      { etiqueta: "Configuración", ruta: "/admin/configuracion", icono: Settings },
      { etiqueta: "Auditoría", ruta: "/admin/auditoria", icono: ScrollText },
    ],
  },
];

export const GRUPOS_NAVEGACION_EMPLEADO: GrupoNavegacion[] = [
  {
    items: [
      { etiqueta: "Dashboard", ruta: "/empleado", icono: LayoutDashboard },
      { etiqueta: "Fichaje QR", ruta: "/empleado/fichaje", icono: QrCode },
      { etiqueta: "Productos", ruta: "/empleado/productos", icono: Package },
      { etiqueta: "Pedidos", ruta: "/empleado/pedidos", icono: ShoppingCart },
    ],
  },
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
