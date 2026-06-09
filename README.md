<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
</p>

# ⚽ Club Social Deportivo — ClubManager360

> Sistema integral de gestión para un club social y deportivo. Administra socios, membresías, instalaciones, reservaciones, pagos, torneos, ludoteca, asistencias e instructores desde una plataforma web moderna con paneles diferenciados por rol.

---

## 📖 Descripción General

**ClubManager360** es una aplicación web full-stack diseñada para digitalizar y centralizar las operaciones administrativas de un club social deportivo. El sistema se compone de:

- **Backend (API REST):** Construido con **Laravel 12** y **PHP 8.2+**, expone una API RESTful protegida con **Laravel Sanctum** que gestiona toda la lógica de negocio, autenticación basada en tokens y la comunicación con una base de datos **PostgreSQL 16**.
- **Frontend (SPA):** Construido con **React 19** y **Vite 7**, consume la API del backend para renderizar una interfaz de usuario moderna, responsiva y con navegación basada en roles (admin, recepción, instructor, socio).

Ambas capas se comunican a través de peticiones HTTP (Axios) y pueden desplegarse de forma independiente o conjunta mediante **Docker Compose**.

---

## ✨ Características Principales

### Backend (API REST — Laravel)
| Módulo | Descripción |
|---|---|
| **Autenticación** | Login con tokens (Sanctum), rutas protegidas por rol, confirmación de contraseña |
| **Socios** | CRUD completo, importación masiva desde CSV, activación de membresías, verificación de acceso |
| **Dependientes** | Gestión de miembros dependientes vinculados a socios titulares |
| **Invitados** | Registro, control de asistencia y expiración automática de pases |
| **Instalaciones** | Catálogo de áreas y espacios del club |
| **Agenda / Actividades** | Programación de clases y sesiones con disciplinas e instructores |
| **Reservaciones** | Sistema de reservas con validación de disponibilidad y bloqueo a usuarios sancionados |
| **Pagos** | Registro de pagos con múltiples métodos, consulta por socio |
| **Torneos** | Motor de torneos con inscripción, sorteo aleatorio, fase de grupos (Round Robin), brackets eliminatorios, marcadores con penales y auto-avance |
| **Ludoteca** | Control de ingreso/salida de niños, ajuste de tiempo, monitoreo en tiempo real |
| **Check-in** | Registro de entrada de socios al club con búsqueda |
| **Asistencias** | Control de asistencias a sesiones con registro por QR |
| **Notificaciones** | Sistema de alertas por usuario con marcado de lectura |
| **Dashboard Admin** | Resumen ejecutivo con métricas generales del club |
| **Dashboard Instructor** | Métricas personalizadas de rendimiento por instructor |

### Frontend (SPA — React)
| Característica | Descripción |
|---|---|
| **Paneles por rol** | Vistas diferenciadas para admin, recepción, instructor y socio |
| **Navegación dinámica** | Sidebar con menú filtrado según el rol del usuario autenticado |
| **Portal del Socio** | Módulo independiente con perfil, reservas, pagos, notificaciones y asistencia QR |
| **Gestión de Torneos** | Interfaz visual para inscripciones, sorteos, brackets y marcadores |
| **Ludoteca en vivo** | Widget de monitoreo con indicadores de tiempo (con tiempo / próximo a vencer / excedido) |
| **Importación de Socios** | Upload de CSV con feedback de resultados |
| **Dashboard Admin** | Gráficos y métricas con Recharts |
| **Diseño responsivo** | TailwindCSS 4 con tema oscuro, iconografía Lucide |

---

## 📁 Estructura del Proyecto

```
club-social-deportivo/
├── backend/                          # API REST — Laravel 12
│   ├── app/
│   │   ├── Console/                  # Comandos Artisan personalizados
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── Api/              # Controladores de la API REST
│   │   │       │   ├── AuthController.php
│   │   │       │   ├── SocioController.php
│   │   │       │   ├── SocioPortalController.php
│   │   │       │   ├── LudotecaController.php
│   │   │       │   ├── AgendaController.php
│   │   │       │   ├── ReservasController.php
│   │   │       │   ├── PagosController.php
│   │   │       │   ├── CheckinController.php
│   │   │       │   ├── InstalacionesController.php
│   │   │       │   ├── InstructorController.php
│   │   │       │   ├── InstructorDashboardController.php
│   │   │       │   ├── AdminDashboardController.php
│   │   │       │   ├── AsistenciasController.php
│   │   │       │   ├── InvitadoController.php
│   │   │       │   ├── SocioImportController.php
│   │   │       │   ├── NotificacionesController.php
│   │   │       │   └── ConfirmPasswordController.php
│   │   │       └── TorneoController.php
│   │   ├── Mail/                     # Clases de correo
│   │   ├── Models/                   # Modelos Eloquent (18 modelos)
│   │   └── Providers/                # Service Providers
│   ├── config/                       # Configuración (DB, auth, sanctum, cors, etc.)
│   ├── database/
│   │   ├── migrations/               # 27 migraciones del esquema
│   │   ├── factories/                # Factories para testing
│   │   └── seeders/                  # Seeders de datos iniciales
│   ├── routes/
│   │   ├── api.php                   # Definición de endpoints REST
│   │   └── web.php                   # Rutas web (mínimas)
│   ├── tests/                        # Pruebas PHPUnit
│   │   ├── Feature/
│   │   └── Unit/
│   ├── .env.example                  # Plantilla de variables de entorno
│   ├── composer.json                 # Dependencias PHP
│   └── artisan                       # CLI de Laravel
│
├── frontend/                         # SPA — React 19 + Vite 7
│   ├── src/
│   │   ├── components/               # Componentes reutilizables (19 componentes)
│   │   │   ├── Sidebar.jsx           # Barra lateral con navegación por rol
│   │   │   ├── TopHeader.jsx         # Cabecera superior
│   │   │   ├── ProtectedRoute.jsx    # HOC de protección por rol
│   │   │   ├── RedirectByRole.jsx    # Redireccionamiento automático post-login
│   │   │   └── ...modales y widgets
│   │   ├── config/                   # Configuración del frontend
│   │   │   ├── api.js                # URL base de la API
│   │   │   └── navigation.js         # Definición central del menú por roles
│   │   ├── context/                  # React Context (estado global)
│   │   │   ├── AuthContext.jsx       # Autenticación y sesión
│   │   │   ├── LudotecaContext.jsx   # Estado de la ludoteca
│   │   │   └── RoleSimulatorContext.jsx
│   │   ├── layouts/                  # Layouts de página
│   │   │   ├── MainLayout.jsx        # Layout principal (admin/recepción/instructor)
│   │   │   └── SocioLayout.jsx       # Layout del portal del socio
│   │   ├── pages/                    # Vistas / Páginas
│   │   │   ├── admin/                # Páginas exclusivas de admin
│   │   │   ├── socio/                # Portal del socio (6 vistas)
│   │   │   ├── Login.jsx
│   │   │   ├── Socios.jsx
│   │   │   ├── Torneos.jsx
│   │   │   ├── Recepcion.jsx
│   │   │   └── ...14 páginas más
│   │   ├── App.jsx                   # Enrutamiento principal
│   │   └── main.jsx                  # Punto de entrada
│   ├── package.json                  # Dependencias Node.js
│   └── vite.config.js                # Configuración de Vite
│
├── docker/                           # Archivos de Docker
│   └── php/                          # Dockerfile para el contenedor PHP
├── docker-compose.yml                # Orquestación de servicios (app + db + pgadmin)
└── .gitignore
```

---

## 🛠️ Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| **PHP** | 8.2+ |
| **Composer** | 2.x |
| **Node.js** | 18+ |
| **npm** | 9+ |
| **PostgreSQL** | 16 |
| **Docker** (opcional) | 24+ |
| **Docker Compose** (opcional) | v2+ |

---

## 🚀 Instalación y Configuración

### Opción A: Con Docker (Recomendado)

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/club-social-deportivo.git
cd club-social-deportivo

# 2. Copia el archivo de entorno del backend
cp backend/.env.example backend/.env

# 3. Levanta los contenedores (app + PostgreSQL + pgAdmin)
docker-compose up -d --build

# 4. Dentro del contenedor de la app, ejecuta las migraciones
docker exec -it clubmanager360_app php artisan key:generate
docker exec -it clubmanager360_app php artisan migrate

# 5. Instala las dependencias del frontend
cd frontend
npm install
npm run dev
```

### Opción B: Instalación Manual (Local)

#### Backend
```bash
cd backend

# Instala las dependencias PHP
composer install

# Configura el entorno
cp .env.example .env
# Edita .env con tus credenciales locales de PostgreSQL

# Genera la clave de la aplicación
php artisan key:generate

# Ejecuta las migraciones
php artisan migrate

# (Opcional) Carga datos de prueba
php artisan db:seed
```

#### Frontend
```bash
cd frontend

# Instala las dependencias
npm install
```

> **Nota:** Si tu backend no corre en `http://127.0.0.1:8000`, actualiza la URL en `frontend/src/config/api.js`.

---

## ▶️ Uso — Ejecución del Proyecto

### Levantar el Backend
```bash
cd backend
php artisan serve
# → API disponible en http://127.0.0.1:8000/api
```

### Levantar el Frontend
```bash
cd frontend
npm run dev
# → Aplicación disponible en http://localhost:5173
```

### Endpoints Principales de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/login` | Autenticación de usuario |
| `GET` | `/api/me` | Obtener usuario autenticado |
| `GET` | `/api/socios` | Listar socios |
| `POST` | `/api/socios/importar` | Importación masiva CSV |
| `GET` | `/api/instalaciones` | Listar instalaciones |
| `GET` | `/api/agenda` | Consultar agenda de actividades |
| `GET/POST` | `/api/reservas` | Gestionar reservaciones |
| `GET/POST` | `/api/pagos` | Gestionar pagos |
| `GET` | `/api/torneos` | Listar torneos |
| `POST` | `/api/torneos/{id}/sorteo` | Generar sorteo de bracket |
| `POST` | `/api/ludoteca/ingreso` | Registrar ingreso a ludoteca |
| `POST` | `/api/checkins` | Registrar check-in |
| `GET` | `/api/admin/dashboard` | Dashboard ejecutivo |
| `POST` | `/api/socio/asistencia/qr` | Registrar asistencia por QR |

### Vistas Principales del Frontend

| Ruta | Rol | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión |
| `/admin/dashboard` | Admin | Panel ejecutivo con métricas |
| `/socios` | Admin, Recepción | Gestión de socios |
| `/instalaciones` | Admin, Recepción | Gestión de instalaciones |
| `/torneos` | Admin, Recepción | Gestión de torneos |
| `/recepcion` | Recepción | Panel de recepción e invitados |
| `/dashboard-instructor` | Instructor | Métricas del instructor |
| `/socio` | Socio | Portal personal del socio |
| `/socio/reservas` | Socio | Mis reservaciones |
| `/socio/asistencia` | Socio | Registro de asistencia por QR |

---

## 🧪 Pruebas

### Backend (PHPUnit)
```bash
cd backend

# Ejecutar todas las pruebas
php artisan test

# Ejecutar solo pruebas unitarias
php artisan test --testsuite=Unit

# Ejecutar solo pruebas de integración
php artisan test --testsuite=Feature
```

### Frontend (ESLint)
```bash
cd frontend

# Análisis estático del código
npm run lint
```

---

## 🐳 Servicios Docker

| Servicio | Contenedor | Puerto | Descripción |
|---|---|---|---|
| **app** | `clubmanager360_app` | `8000` | Servidor Laravel (PHP) |
| **db** | `clubmanager360_db` | `5432` | Base de datos PostgreSQL 16 |
| **pgadmin** | `clubmanager360_pgadmin` | `5050` | Interfaz web de administración de BD |

Credenciales por defecto de pgAdmin:
- **Email:** `admin@clubmanager360.com`
- **Password:** `admin123`

---

## 🧰 Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12, PHP 8.2+, Laravel Sanctum |
| Frontend | React 19, Vite 7, React Router 7, Axios |
| Estilos | Tailwind CSS 4, Lucide React (iconos) |
| Gráficos | Recharts |
| QR | html5-qrcode, qrcode.react |
| Base de Datos | PostgreSQL 16 |
| Contenedores | Docker, Docker Compose |
| Testing | PHPUnit 11, ESLint |

---

## 📬 Contacto

| | |
|---|---|
| **Autor** | Kevin |
| **Proyecto** | Club Social Deportivo — ClubManager360 |
| **Repositorio** | [GitHub](https://github.com/tu-usuario/club-social-deportivo) |

