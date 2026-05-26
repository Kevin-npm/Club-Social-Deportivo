import {
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  NotebookPen,
  CalendarDays,
  Trophy,
  BellRing,
  Activity,
  Upload,
  Puzzle,
} from "lucide-react";

// Fuente central de navegación
export const MenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin"],
  },
  {
    title: "Ludoteca",
    icon: Puzzle,
    path: "/ludoteca",
    roles: ["admin"],
  },
  {
    title: "Mi Rendimiento",
    icon: Activity,
    path: "/dashboard-instructor",
    roles: ["instructor"],
  },
  {
    title: "Instalaciones",
    icon: Building2,
    path: "/instalaciones",
    roles: ["admin"],
  },
  {
    id: "recepcion",
    title: "Recepción",
    path: "/recepcion",
    icon: BellRing,
    roles: ["admin"],
  },
  {
    title: "Socios",
    icon: Users,
    path: "/socios",
    roles: ["admin"],
  },
  {
    title: "Importar Socios",
    icon: Upload,
    path: "/socios/importar",
    roles: ["admin"],
  },
  {
    title: "Dependientes",
    icon: UserRound,
    path: "/dependientes",
    roles: ["admin"],
  },
  {
    title: "Instructores",
    path: "/instructores",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Agenda y Reservaciones",
    icon: NotebookPen,
    path: "/actividades",
    roles: ["admin"],
  },
  {
    title: "Sesiones",
    icon: CalendarDays,
    path: "/sesiones",
    roles: ["admin"],
  },
  {
    title: "Mi Calendario",
    icon: CalendarDays,
    path: "/calendario-instructor",
    roles: ["instructor"],
  },
  {
    title: "Torneos",
    icon: Trophy,
    path: "/torneos",
    roles: ["admin", "instructor"],
  },
];