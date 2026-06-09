<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router 7" />
</p>

# 🖥️ ClubManager360 — Frontend (SPA)

> Aplicación de Página Única (SPA) construida con React 19 y Vite 7 que proporciona la interfaz de usuario del sistema Club Social Deportivo. Ofrece paneles diferenciados por rol (admin, recepción, instructor, socio) con un diseño moderno en tema oscuro utilizando Tailwind CSS 4.

---

## 📖 Descripción

Este directorio contiene el frontend del proyecto **ClubManager360**. Es una SPA que consume la API REST del backend (Laravel) a través de Axios y presenta la información en una interfaz visual moderna, responsiva y organizada por roles de usuario.

### Responsabilidades principales:
- Autenticación de usuarios con persistencia de sesión (token Sanctum)
- Renderización de paneles diferenciados según el rol del usuario
- Interfaz de gestión para socios, instalaciones, agenda, reservas, pagos y torneos
- Portal exclusivo del socio con acceso a perfil, reservas, pagos, notificaciones y asistencia QR
- Dashboard ejecutivo con gráficos y métricas (Recharts)
- Monitoreo en tiempo real de la ludoteca
- Lectura y generación de códigos QR para asistencia

---

## 📁 Estructura de Carpetas

```
frontend/
├── public/                           # Archivos estáticos públicos
├── src/
│   ├── assets/                       # Imágenes y recursos estáticos
│   ├── components/                   # 19 componentes reutilizables
│   │   ├── Sidebar.jsx               # Barra lateral con menú filtrado por rol
│   │   ├── TopHeader.jsx             # Cabecera superior con acciones
│   │   ├── ProtectedRoute.jsx        # HOC: protección de rutas por rol
│   │   ├── RedirectByRole.jsx        # Redirección automática post-login
│   │   ├── InfoBox.jsx               # Tarjeta de información reutilizable
│   │   ├── PageHeader.jsx            # Encabezado de página estándar
│   │   ├── SideBarItem.jsx           # Elemento individual del sidebar
│   │   ├── LudotecaLiveWidget.jsx    # Widget de monitoreo de ludoteca en vivo
│   │   ├── TorneoDetailsModal.jsx    # Modal de detalles de torneo
│   │   ├── AddAgendamodal.jsx        # Modal: crear actividad
│   │   ├── EditAgendamodal.jsx       # Modal: editar actividad
│   │   ├── Agendadeatilsmodal.jsx    # Modal: detalles de actividad
│   │   ├── AsistenciasModal.jsx      # Modal: control de asistencias
│   │   ├── AddFacilityModal.jsx      # Modal: crear instalación
│   │   ├── EditFacilityModal.jsx     # Modal: editar instalación
│   │   ├── FacilityDetailsModal.jsx  # Modal: detalles de instalación
│   │   ├── AddReservaModal.jsx       # Modal: crear reservación
│   │   ├── EditReservaModal.jsx      # Modal: editar reservación
│   │   └── ReservaDetailsModal.jsx   # Modal: detalles de reservación
│   ├── config/                       # Configuración
│   │   ├── api.js                    # URL base de la API (http://127.0.0.1:8000/api)
│   │   ├── navigation.js            # ★ Definición centralizada del menú por roles
│   │   └── header_actions.js         # Acciones disponibles en la cabecera
│   ├── context/                      # React Context (estado global)
│   │   ├── AuthContext.jsx           # Autenticación, token y datos de sesión
│   │   ├── LudotecaContext.jsx       # Estado y lógica de la ludoteca
│   │   └── RoleSimulatorContext.jsx  # Simulación de roles (desarrollo)
│   ├── layouts/                      # Layouts de página
│   │   ├── MainLayout.jsx            # Layout para admin, recepción e instructor
│   │   └── SocioLayout.jsx           # Layout exclusivo del portal del socio
│   ├── pages/                        # Vistas de la aplicación
│   │   ├── admin/                    # Páginas del administrador
│   │   │   ├── AdminDashboard.jsx    # Dashboard ejecutivo con métricas
│   │   │   └── SocioImport.jsx       # Importación masiva de socios (CSV)
│   │   ├── socio/                    # Portal del socio
│   │   │   ├── SocioHome.jsx         # Inicio del portal
│   │   │   ├── Dashboard.jsx         # Monitoreo de ludoteca
│   │   │   ├── SocioReservas.jsx     # Mis reservaciones
│   │   │   ├── SocioPagos.jsx        # Mis pagos
│   │   │   ├── SocioAsistencia.jsx   # Asistencia por QR
│   │   │   └── SocioNotificaciones.jsx # Mis notificaciones
│   │   ├── Login.jsx                 # Pantalla de inicio de sesión
│   │   ├── SetPassword.jsx           # Configuración de contraseña
│   │   ├── Socios.jsx                # Gestión completa de socios
│   │   ├── Dependientes.jsx          # Gestión de dependientes
│   │   ├── Instructores.jsx          # Gestión de instructores
│   │   ├── Instalaciones.jsx         # Gestión de instalaciones
│   │   ├── Actividades.jsx           # Agenda y reservaciones
│   │   ├── Sesiones.jsx              # Sesiones de actividades
│   │   ├── Pagos.jsx                 # Gestión de pagos
│   │   ├── Torneos.jsx               # Gestión de torneos (brackets, marcadores)
│   │   ├── Recepcion.jsx             # Panel de recepción e invitados
│   │   ├── Checkin.jsx               # Check-in de socios
│   │   ├── DashboardInstructor.jsx   # Dashboard del instructor
│   │   └── CalendarioInstructor.jsx  # Calendario del instructor
│   ├── App.jsx                       # ★ Enrutamiento principal de la aplicación
│   ├── App.css                       # Estilos globales
│   ├── main.jsx                      # Punto de entrada de React
│   └── index.css                     # Estilos base (Tailwind)
├── index.html                        # Documento HTML raíz
├── package.json                      # Dependencias y scripts
├── vite.config.js                    # Configuración de Vite
├── tailwind.config.js                # Configuración de Tailwind CSS
├── eslint.config.js                  # Configuración de ESLint
└── .gitignore
```

---

## 🛠️ Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Backend API | Corriendo en `http://127.0.0.1:8000` |

---

## 🚀 Instalación

```bash
# 1. Navega al directorio del frontend
cd frontend

# 2. Instala las dependencias
npm install
```

### Configuración de la API
La URL base de la API se define en `src/config/api.js`:

```javascript
const API_BASE_URL = "http://127.0.0.1:8000/api";
export default API_BASE_URL;
```

Si tu backend corre en otro host o puerto, modifica este archivo.

---

## ▶️ Ejecución

```bash
# Modo desarrollo (con Hot Module Replacement)
npm run dev
# → Disponible en http://localhost:5173

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Análisis estático (linting)
npm run lint
```

> **Importante:** Asegúrate de que el backend esté corriendo antes de iniciar el frontend para que las peticiones a la API funcionen correctamente.

---

## 🗺️ Rutas de la Aplicación

### Rutas Públicas
| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `Login.jsx` | Pantalla de inicio de sesión |
| `/set-password` | `SetPassword.jsx` | Configuración de contraseña |

### Rutas del Panel Principal (Admin / Recepción / Instructor)
| Ruta | Componente | Roles |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard.jsx` | Admin |
| `/socios` | `Socios.jsx` | Admin, Recepción |
| `/socios/importar` | `SocioImport.jsx` | Admin |
| `/dependientes` | `Dependientes.jsx` | Admin, Recepción |
| `/instructores` | `Instructores.jsx` | Admin, Recepción |
| `/instalaciones` | `Instalaciones.jsx` | Admin, Recepción |
| `/actividades` | `Actividades.jsx` | Admin, Recepción |
| `/sesiones` | `Sesiones.jsx` | Admin, Recepción |
| `/torneos` | `Torneos.jsx` | Admin, Recepción |
| `/pagos` | `Pagos.jsx` | Todos |
| `/recepcion` | `Recepcion.jsx` | Recepción |
| `/check-in` | `Checkin.jsx` | Admin, Recepción, Instructor |
| `/dashboard-instructor` | `DashboardInstructor.jsx` | Instructor |
| `/calendario-instructor` | `CalendarioInstructor.jsx` | Instructor |

### Rutas del Portal del Socio (protegidas por rol `socio`)
| Ruta | Componente | Descripción |
|---|---|---|
| `/socio` | `SocioHome.jsx` | Inicio del portal |
| `/socio/dashboard` | `Dashboard.jsx` | Monitoreo de ludoteca |
| `/socio/reservas` | `SocioReservas.jsx` | Mis reservaciones |
| `/socio/pagos` | `SocioPagos.jsx` | Mis pagos |
| `/socio/asistencia` | `SocioAsistencia.jsx` | Asistencia por QR |
| `/socio/notificaciones` | `SocioNotificaciones.jsx` | Mis notificaciones |

---

## 🎨 Diseño y UI

- **Tema:** Oscuro (fondo `#0f131a`, tarjetas `#14171c`)
- **Framework CSS:** Tailwind CSS 4
- **Iconografía:** Lucide React
- **Gráficos:** Recharts
- **QR:** html5-qrcode (lectura) + qrcode.react (generación)
- **Tipografía:** Sistema nativo (sans-serif)
- **Responsivo:** Diseño adaptable a móvil, tablet y escritorio

---

## 📦 Dependencias Principales

### Producción
| Paquete | Versión | Propósito |
|---|---|---|
| `react` | ^19.2.4 | Librería UI |
| `react-dom` | ^19.2.4 | Renderizado DOM |
| `react-router-dom` | ^7.13.1 | Enrutamiento SPA |
| `axios` | ^1.14.0 | Cliente HTTP para la API |
| `tailwindcss` | ^4.2.1 | Framework CSS utility-first |
| `lucide-react` | ^0.577.0 | Iconos SVG |
| `recharts` | ^3.8.1 | Gráficos y visualizaciones |
| `html5-qrcode` | ^2.3.8 | Lector de códigos QR |
| `qrcode.react` | ^4.2.0 | Generador de códigos QR |
| `styled-components` | ^6.4.2 | CSS-in-JS (componentes específicos) |

### Desarrollo
| Paquete | Versión | Propósito |
|---|---|---|
| `vite` | ^7.3.2 | Bundler y dev server |
| `@vitejs/plugin-react` | ^5.2.0 | Plugin React para Vite |
| `eslint` | ^9.39.4 | Linting de código |
| `eslint-plugin-react-hooks` | ^7.0.1 | Reglas para React Hooks |

---

## 🧪 Análisis de Código

```bash
# Ejecutar ESLint para verificar calidad del código
npm run lint
```

---

