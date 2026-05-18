<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use App\Models\Reservas;
use App\Models\Instalaciones;
use App\Models\Pago;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SocioPortalController extends Controller
{
    private function obtenerSocioAutenticado(Request $request)
    {
        $usuario = $request->user();

        if ((int) $usuario->id_rol !== 2) {
            return [
                'error' => response()->json([
                    'message' => 'No autorizado. Esta sección es solo para socios.'
                ], 403)
            ];
        }

        $socio = Socio::where('id_usuario', $usuario->id_usuario)->first();

        if (!$socio) {
            return [
                'error' => response()->json([
                    'message' => 'No existe un socio asociado a este usuario.'
                ], 404)
            ];
        }

        return [
            'socio' => $socio
        ];
    }

    public function perfil(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        return response()->json([
            'socio' => $resultado['socio']
        ]);
    }

    public function reservas(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $reservas = Reservas::with(['espacio'])
            ->where('id_socio', $socio->id_socio)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_inicio', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservas
        ]);
    }

    public function pagos(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $pagos = Pago::with(['metodo'])
            ->where('id_socio', $socio->id_socio)
            ->orderBy('fecha_pago', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => $pagos->count(),
            'data' => $pagos
        ]);
    }

    public function notificaciones(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $notificaciones = Notificacion::where('id_socio', $socio->id_socio)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => $notificaciones->count(),
            'sin_leer' => $notificaciones->where('leido_boolean', false)->count(),
            'data' => $notificaciones
        ]);
    }

    public function marcarNotificacionComoLeida(Request $request, $id)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $notificacion = Notificacion::where('id_notificacion', $id)
            ->where('id_socio', $socio->id_socio)
            ->first();

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada o no pertenece al socio autenticado.'
            ], 404);
        }

        if (!$notificacion->leido_boolean) {
            $notificacion->marcarComoLeida();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Notificación marcada como leída correctamente.',
            'data' => $notificacion->fresh()
        ]);
    }

        public function marcarTodasNotificacionesComoLeidas(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $actualizadas = Notificacion::where('id_socio', $socio->id_socio)
            ->where('leido_boolean', false)
            ->update([
                'leido_boolean' => true,
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Todas las notificaciones fueron marcadas como leídas.',
            'actualizadas' => $actualizadas,
        ]);
    }

        public function detalleReserva(Request $request, $id)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $reserva = Reservas::with(['espacio'])
            ->where('id_reserva', $id)
            ->where('id_socio', $socio->id_socio)
            ->first();

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada o no pertenece al socio autenticado.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $reserva
        ]);
    }

    public function cancelarReserva(Request $request, $id)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $reserva = Reservas::where('id_reserva', $id)
            ->where('id_socio', $socio->id_socio)
            ->first();

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada o no pertenece al socio autenticado.'
            ], 404);
        }

        if ($reserva->estatus !== 'Activa') {
            return response()->json([
                'message' => 'Solo se pueden cancelar reservas con estatus Activa.'
            ], 422);
        }

        $reserva->update([
            'estatus' => 'Cancelada',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reserva cancelada correctamente.',
            'data' => $reserva->fresh()->load(['espacio'])
        ]);
    }

        public function detallePago(Request $request, $id)
    {
        $resultado = $this->obtenerSocioAutenticado($request);

        if (isset($resultado['error'])) {
            return $resultado['error'];
        }

        $socio = $resultado['socio'];

        $pago = Pago::with(['metodo'])
            ->where('id_pago', $id)
            ->where('id_socio', $socio->id_socio)
            ->first();

        if (!$pago) {
            return response()->json([
                'message' => 'Pago no encontrado o no pertenece al socio autenticado.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pago
        ]);
    }

    /**
     * GET /api/socio/reservas/disponibilidad?id_espacio=X&fecha=YYYY-MM-DD
     * Devuelve los horarios ya ocupados para un espacio en una fecha dada.
     */
    public function disponibilidad(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);
        if (isset($resultado['error'])) return $resultado['error'];

        $request->validate([
            'id_espacio' => 'required|integer|exists:tbl_instalaciones,id_espacio',
            'fecha'      => 'required|date_format:Y-m-d',
        ]);

        $fecha   = $request->query('fecha');
        $espacio = (int) $request->query('id_espacio');

        // Ventana ampliada: acepta cualquier fecha desde ayer hasta pasado mañana
        // Esto garantiza que usuarios en zonas UTC-X puedan reservar correctamente
        $fechaCarbon = Carbon::parse($fecha);
        $limiteMin   = Carbon::today()->subDay();         // ayer UTC
        $limiteMax   = Carbon::today()->addDays(2);       // pasado mañana UTC

        if ($fechaCarbon->lt($limiteMin) || $fechaCarbon->gt($limiteMax)) {
            return response()->json([
                'message' => 'Solo se pueden consultar disponibilidades para hoy o mañana.'
            ], 422);
        }

        $reservas = Reservas::where('id_espacio', $espacio)
            ->where('fecha', $fecha)
            ->whereIn('estatus', ['Activa', 'Completada'])
            ->select('hora_inicio', 'hora_fin')
            ->get();

        return response()->json([
            'status'   => 'success',
            'fecha'    => $fecha,
            'espacio'  => $espacio,
            'ocupados' => $reservas,
        ]);
    }

    /**
     * POST /api/socio/reservas
     * Crea una nueva reserva desde el portal del socio.
     */
    public function crearReserva(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);
        if (isset($resultado['error'])) return $resultado['error'];

        $socio = $resultado['socio'];

        $validated = $request->validate([
            'id_espacio'  => 'required|integer|exists:tbl_instalaciones,id_espacio',
            'fecha'       => 'required|date_format:Y-m-d',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i',
        ]);

        // Validar manualmente que hora_fin > hora_inicio (evita bug de strtotime con H:i)
        if ($validated['hora_fin'] <= $validated['hora_inicio']) {
            return response()->json([
                'message' => 'La hora de fin debe ser posterior a la hora de inicio.'
            ], 422);
        }

        // Ventana permisiva: desde ayer hasta pasado mañana (cubre cualquier UTC offset)
        $fechaCarbon = Carbon::parse($validated['fecha'])->startOfDay();
        $limiteMin   = Carbon::now()->subDays(1)->startOfDay();
        $limiteMax   = Carbon::now()->addDays(2)->startOfDay();

        if ($fechaCarbon->lt($limiteMin) || $fechaCarbon->gt($limiteMax)) {
            return response()->json([
                'message' => 'Solo puedes reservar para hoy o mañana.'
            ], 422);
        }

        // Verificar que no haya conflicto de horario
        $conflicto = Reservas::where('id_espacio', $validated['id_espacio'])
            ->where('fecha', $validated['fecha'])
            ->whereIn('estatus', ['Activa', 'Completada'])
            ->where(function ($q) use ($validated) {
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                  ->where('hora_fin',    '>',  $validated['hora_inicio']);
            })
            ->exists();

        if ($conflicto) {
            return response()->json([
                'message' => 'El horario seleccionado ya está ocupado. Elige otro.'
            ], 409);
        }

        // Generar folio único
        $folio = 'RES-' . strtoupper(Str::random(8));

        $reserva = Reservas::create([
            'id_socio'       => $socio->id_socio,
            'id_espacio'     => $validated['id_espacio'],
            'fecha'          => $validated['fecha'],
            'hora_inicio'    => $validated['hora_inicio'],
            'hora_fin'       => $validated['hora_fin'],
            'folio_reserva'  => $folio,
            'estatus'        => 'Activa',
            'estatus_noshow' => false,
        ]);

        $reserva->load(['espacio']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reserva creada correctamente.',
            'data'    => $reserva,
        ], 201);
    }
}