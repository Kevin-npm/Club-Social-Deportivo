<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.2+" />
  <img src="https://img.shields.io/badge/Sanctum-Auth-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Sanctum" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

# 🔧 ClubManager360 — Backend (API REST)

> API RESTful construida con Laravel 12 que gestiona toda la lógica de negocio del sistema Club Social Deportivo. Provee autenticación basada en tokens (Sanctum), endpoints CRUD para cada módulo y comunicación con una base de datos PostgreSQL 16.

---

## 📖 Descripción

Este directorio contiene el backend del proyecto **ClubManager360**. Es una API REST que sirve como capa de datos y lógica de negocio para el frontend (React SPA). No sirve vistas HTML; toda la comunicación se realiza mediante respuestas JSON.

### Responsabilidades principales:
- Autenticación y autorización por tokens (Laravel Sanctum)
- CRUD de socios, dependientes, instructores e invitados
- Gestión de instalaciones, agenda, reservaciones y pagos
- Motor de torneos con sorteos, brackets y marcadores
- Control de ludoteca con monitoreo de tiempos
- Sistema de check-in y asistencias (incluyendo QR)
- Notificaciones por usuario
- Dashboards con métricas (admin e instructor)
- Importación masiva de socios desde CSV

---

## 📁 Estructura de Carpetas

```
backend/
├── app/
│   ├── Console/                  # Comandos Artisan personalizados
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Api/              # 17 controladores de la API
│   │       │   ├── AuthController.php            # Login, logout, sesión
│   │       │   ├── SocioController.php           # CRUD de socios
│   │       │   ├── SocioPortalController.php     # Portal del socio autenticado
│   │       │   ├── SocioImportController.php     # Importación CSV
│   │       │   ├── LudotecaController.php        # Ingreso/salida de ludoteca
│   │       │   ├── AgendaController.php          # Agenda de actividades
│   │       │   ├── ReservasController.php        # Reservaciones
│   │       │   ├── PagosController.php           # Pagos
│   │       │   ├── CheckinController.php         # Check-in de socios
│   │       │   ├── InstalacionesController.php   # Instalaciones del club
│   │       │   ├── InstructorController.php      # CRUD de instructores
│   │       │   ├── InstructorDashboardController.php
│   │       │   ├── AdminDashboardController.php  # Métricas ejecutivas
│   │       │   ├── AsistenciasController.php     # Asistencias a sesiones
│   │       │   ├── InvitadoController.php        # Gestión de invitados
│   │       │   ├── NotificacionesController.php  # Alertas del usuario
│   │       │   └── ConfirmPasswordController.php
│   │       └── TorneoController.php              # Motor de torneos
│   ├── Mail/                     # Clases Mailable
│   ├── Models/                   # 18 modelos Eloquent
│   │   ├── User.php              # Modelo de autenticación
│   │   ├── Socio.php             # Socio del club
│   │   ├── Torneo.php            # Torneo deportivo
│   │   ├── Agenda.php            # Sesión de actividad
│   │   ├── Instalaciones.php     # Espacio/área del club
│   │   ├── Reservas.php          # Reservación de espacio
│   │   ├── Pago.php              # Pago registrado
│   │   └── ...11 modelos más
│   └── Providers/                # Service Providers de Laravel
├── config/                       # Archivos de configuración
│   ├── cors.php                  # Configuración CORS para el frontend
│   ├── sanctum.php               # Configuración de autenticación por tokens
│   ├── database.php              # Conexiones a bases de datos
│   └── ...9 archivos más
├── database/
│   ├── migrations/               # 27 migraciones (esquema completo de la BD)
│   ├── factories/                # Factories para generar datos de prueba
│   └── seeders/                  # Seeders de datos iniciales
├── routes/
│   ├── api.php                   # ★ Definición de todos los endpoints REST
│   ├── web.php                   # Rutas web (mínimas)
│   └── console.php               # Rutas de consola
├── storage/                      # Almacenamiento (logs, cache, archivos)
├── tests/
│   ├── Feature/                  # Pruebas de integración
│   └── Unit/                     # Pruebas unitarias
├── .env.example                  # ★ Plantilla de variables de entorno
├── composer.json                 # Dependencias PHP y scripts
├── artisan                       # CLI de Laravel
└── phpunit.xml                   # Configuración de PHPUnit
```

---

## 🛠️ Requisitos

| Herramienta | Versión |
|---|---|
| PHP | 8.2+ |
| Composer | 2.x |
| PostgreSQL | 16 |
| Extensiones PHP | `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json` |

---

## 🚀 Instalación

```bash
# 1. Navega al directorio del backend
cd backend

# 2. Instala las dependencias PHP
composer install

# 3. Configura tu entorno
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=clubmanager360
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

```bash
# 4. Genera la clave de la aplicación
php artisan key:generate

# 5. Ejecuta las migraciones para crear las tablas
php artisan migrate

# 6. (Opcional) Carga datos de prueba
php artisan db:seed
```

---

## ▶️ Ejecución

```bash
# Inicia el servidor de desarrollo
php artisan serve

# La API estará disponible en:
# → http://127.0.0.1:8000/api
```

### Verificar que la API funciona:
```bash
curl http://127.0.0.1:8000/api/test
# Respuesta esperada: {"mensaje":"API funcionando correctamente"}
```

---

## 📡 Endpoints de la API

### Públicos (sin autenticación)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/test` | Verificación de salud |
| `POST` | `/api/login` | Autenticación, devuelve token |
| `GET` | `/api/instalaciones` | Listar instalaciones |
| `GET` | `/api/torneos` | Listar torneos |
| `GET` | `/api/pagos/metodos` | Métodos de pago disponibles |

### Protegidos — Autenticación Sanctum (`auth:sanctum`)
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/me` | Datos del usuario autenticado |
| `POST` | `/api/logout` | Cerrar sesión |
| `GET` | `/api/socio/perfil` | Perfil del socio |
| `GET` | `/api/socio/reservas` | Reservaciones del socio |
| `POST` | `/api/socio/reservas` | Crear nueva reserva |
| `GET` | `/api/socio/pagos` | Historial de pagos |
| `GET` | `/api/socio/notificaciones` | Notificaciones del socio |
| `POST` | `/api/socio/asistencia/qr` | Registrar asistencia vía QR |

### Protegidos — Middleware de Rol
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/socios` | CRUD de socios |
| `POST` | `/api/socios/importar` | Importar socios desde CSV |
| `GET/POST` | `/api/agenda` | Gestión de agenda |
| `GET/POST` | `/api/reservas` | Gestión de reservaciones |
| `POST` | `/api/torneos/{id}/sorteo` | Generar sorteo de torneo |
| `POST` | `/api/encuentros/{id}/marcador` | Guardar marcador |
| `POST` | `/api/ludoteca/ingreso` | Registrar ingreso a ludoteca |
| `GET` | `/api/admin/dashboard` | Métricas del dashboard admin |

---

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
php artisan test

# Solo pruebas unitarias
php artisan test --testsuite=Unit

# Solo pruebas de integración
php artisan test --testsuite=Feature

# Con cobertura (requiere Xdebug)
php artisan test --coverage
```

---

## 📦 Dependencias Principales

| Paquete | Propósito |
|---|---|
| `laravel/framework` ^12.0 | Framework base |
| `laravel/sanctum` ^4.3 | Autenticación por tokens SPA/API |
| `laravel/tinker` ^2.10 | REPL interactivo |
| `phpunit/phpunit` ^11.5 | Framework de pruebas |
| `fakerphp/faker` ^1.23 | Generación de datos falsos |

---

