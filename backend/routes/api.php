<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LudotecaController;
use App\Http\Controllers\Api\CheckinController;
use App\Http\Controllers\Api\SocioController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\InstalacionesController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\ReservasController;
use App\Http\Controllers\Api\SocioImportController;
use App\Http\Controllers\Api\AsistenciasController;
use App\Http\Controllers\Api\PagosController;
use App\Http\Controllers\Api\InstructorDashboardController;
use App\Http\Controllers\Api\ConfirmPasswordController;
use App\Http\Controllers\Api\NotificacionesController;
use App\Http\Controllers\Api\SocioPortalController;
use App\Http\Controllers\Api\InvitadoController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\UserSettingsController;

use App\Http\Controllers\TorneoController;
use App\Http\Controllers\SocioPdfController;

Route::get('/test', function () {
    return response()->json([
        'mensaje' => 'API funcionando correctamente',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/confirmar-password', [ConfirmPasswordController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user/settings', [UserSettingsController::class, 'show']);
    Route::put('/user/settings', [UserSettingsController::class, 'update']);

    Route::get('/user/notificaciones', [NotificacionesController::class, 'index']);
    Route::put('/user/notificaciones/{id}/leer', [NotificacionesController::class, 'marcarLeida']);

    /*
    |--------------------------------------------------------------------------
    | Rutas compartidas autenticadas
    |--------------------------------------------------------------------------
    */

    Route::get('/instalaciones', [InstalacionesController::class, 'index']);
    Route::get('/instalaciones/{id}', [InstalacionesController::class, 'show']);
    Route::get('/categorias', [InstalacionesController::class, 'getCategories']);

    /*
    |--------------------------------------------------------------------------
    | Agenda compartida
    |--------------------------------------------------------------------------
    | Admin e instructor pueden consultar agenda.
    */

    Route::get('/agenda/catalogo/disciplinas', [AgendaController::class, 'getDisciplinas']);
    Route::get('/agenda/catalogo/instructores', [AgendaController::class, 'getInstructores']);
    Route::get('/agenda', [AgendaController::class, 'index']);
    Route::get('/agenda/{id}', [AgendaController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Reservas lectura compartida
    |--------------------------------------------------------------------------
    */

    Route::get('/reservas', [ReservasController::class, 'index']);
    Route::get('/reservas/{id}', [ReservasController::class, 'show']);
});



/*
|--------------------------------------------------------------------------
| Portal socio
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:socio'])->prefix('socio')->group(function () {

    Route::get('/perfil', [SocioPortalController::class, 'perfil']);

    Route::get('/reservas/disponibilidad', [SocioPortalController::class, 'disponibilidad']);
    Route::get('/reservas', [SocioPortalController::class, 'reservas']);
    Route::post('/reservas', [SocioPortalController::class, 'crearReserva']);
    Route::get('/reservas/{id}', [SocioPortalController::class, 'detalleReserva']);
    Route::patch('/reservas/{id}/cancelar', [SocioPortalController::class, 'cancelarReserva']);

    Route::get('/pagos', [SocioPortalController::class, 'pagos']);
    Route::get('/pagos/{id}', [SocioPortalController::class, 'detallePago']);

    Route::get('/notificaciones', [SocioPortalController::class, 'notificaciones']);
    Route::patch('/notificaciones/leer-todas', [SocioPortalController::class, 'marcarTodasNotificacionesComoLeidas']);
    Route::patch('/notificaciones/{id}/leer', [SocioPortalController::class, 'marcarNotificacionComoLeida']);

    Route::post('/asistencia/qr', [SocioPortalController::class, 'registrarAsistenciaQr']);

    Route::get('/ludoteca/mi-status', [LudotecaController::class, 'miStatus']);
});



/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {

    Route::post('/socios/importar', [SocioImportController::class, 'import']);

    Route::apiResource('socios', SocioController::class);

    Route::patch('/socios/{id}/activar', [SocioController::class, 'activarMembresia']);
    Route::get('/dependientes', [SocioController::class, 'dependientes']);
    Route::get('/titulares', [SocioController::class, 'titulares']);
    Route::get('/socios/{id}/verificar-acceso', [SocioController::class, 'verificarAcceso']);

    Route::apiResource('invitados', InvitadoController::class);

    Route::post('/invitados/{id}/marcar-asistencia', [InvitadoController::class, 'marcarAsistencia']);
    Route::get('/socios/{id}/invitados', [InvitadoController::class, 'porSocio']);
    Route::post('/invitados/expirar-antiguos', [InvitadoController::class, 'expirarAntiguos']);

    /*
    |--------------------------------------------------------------------------
    | Instalaciones
    |--------------------------------------------------------------------------
    */

    Route::post('/instalaciones', [InstalacionesController::class, 'store']);
    Route::put('/instalaciones/{id}', [InstalacionesController::class, 'update']);

    /*
    |--------------------------------------------------------------------------
    | Agenda escritura admin
    |--------------------------------------------------------------------------
    */

    Route::post('/agenda', [AgendaController::class, 'store']);
    Route::put('/agenda/{id}', [AgendaController::class, 'update']);
    Route::delete('/agenda/{id}', [AgendaController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Reservas escritura admin
    |--------------------------------------------------------------------------
    */

    Route::post('/reservas', [ReservasController::class, 'store'])
        ->middleware('bloquear.sancionado');

    Route::put('/reservas/{id}', [ReservasController::class, 'update']);
    Route::delete('/reservas/{id}', [ReservasController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Pagos
    |--------------------------------------------------------------------------
    */

    Route::get('/pagos/metodos', [PagosController::class, 'getMetodos']);
    Route::get('/pagos', [PagosController::class, 'index']);
    Route::get('/pagos/{id}', [PagosController::class, 'show']);
    Route::post('/pagos', [PagosController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | Instructores
    |--------------------------------------------------------------------------
    */

    Route::apiResource('instructors', InstructorController::class);

    /*
    |--------------------------------------------------------------------------
    | Asistencias
    |--------------------------------------------------------------------------
    */

    Route::get('/asistencias/sesion/{id_sesion}', [AsistenciasController::class, 'porSesion']);
    Route::get('/asistencias', [AsistenciasController::class, 'index']);
    Route::post('/asistencias', [AsistenciasController::class, 'store']);
    Route::delete('/asistencias/{id}', [AsistenciasController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Ludoteca
    |--------------------------------------------------------------------------
    */

    Route::post('/ludoteca/ingreso', [LudotecaController::class, 'registrarIngreso']);
    Route::post('/ludoteca/salida', [LudotecaController::class, 'registrarSalida']);
    Route::post('/ludoteca/ajustar-tiempo', [LudotecaController::class, 'ajustarTiempo']);
    Route::post('/ludoteca/reset-tiempo', [LudotecaController::class, 'resetTiempo']);

    /*
    |--------------------------------------------------------------------------
    | Checkin
    |--------------------------------------------------------------------------
    */

    Route::get('/checkins/buscar', [CheckinController::class, 'buscarSocio']);
    Route::get('/checkins', [CheckinController::class, 'index']);
    Route::post('/checkins', [CheckinController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | Dashboard admin
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/dashboard/metrics', [AdminDashboardController::class, 'metrics']);

    /*
    |--------------------------------------------------------------------------
    | Importación / exportación
    |--------------------------------------------------------------------------
    */

    Route::get('/socios/exportar/csv', [SocioImportController::class, 'exportCsv']);
    Route::get('/socios/plantilla/csv', [SocioImportController::class, 'templateCsv']);
    Route::get('/socios/exportar/pdf', [SocioPdfController::class, 'exportarPdf']);

    /*
    |--------------------------------------------------------------------------
    | Torneos
    |--------------------------------------------------------------------------
    */

    Route::get('/torneos', [TorneoController::class, 'index']);
    Route::get('/torneos/{id}/inscripciones', [TorneoController::class, 'getInscripciones']);

    Route::post('/torneos/{id}/inscribir', [TorneoController::class, 'inscribir']);

    Route::put('/inscripciones/{id}', [TorneoController::class, 'editarInscripcion']);

    Route::delete('/inscripciones/{id}', [TorneoController::class, 'eliminarInscripcion']);

    Route::post('/torneos/{id}/sorteo', [TorneoController::class, 'generarSorteo']);

    Route::get('/torneos/{id}/llaves', [TorneoController::class, 'getLlaves']);

    Route::post('/encuentros/{id}/marcador', [TorneoController::class, 'guardarMarcador']);

    Route::post('/torneos/{id}/clasificar', [TorneoController::class, 'generarClasificacion']);

    Route::apiResource('torneos', TorneoController::class)->except(['index']);
});



/*
|--------------------------------------------------------------------------
| Instructor
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:instructor'])->group(function () {

    Route::get('/instructor/dashboard', [InstructorDashboardController::class, 'getMetricas']);

    Route::get('/asistencias/sesion/{id_sesion}', [AsistenciasController::class, 'porSesion']);
    Route::get('/asistencias', [AsistenciasController::class, 'index']);
    Route::post('/asistencias', [AsistenciasController::class, 'store']);
});