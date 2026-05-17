import {
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  NotebookPen,
  CalendarDays,
  Trophy,
  BellRing,
  BellPlus,
  Banknote,
  Activity,
} from "lucide-react";

// Fuente central de navegación
export const MenuItems = [
  {
    title: "Dashboard Ludoteca",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin", "instructor"],
  },
  {
    title: "Mi Rendimiento",
    icon: Activity,
    path: "/dashboard-instructor",
    roles: ["instructor", "admin"], 
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
  {
    title: "Check-in",
    icon: BellPlus,
    path: "/check-in",
    roles: ["admin"],
  },
  {
    title: "Pagos",
    icon: Banknote,
    path: "/pagos",
    roles: ["admin"],
  },
];