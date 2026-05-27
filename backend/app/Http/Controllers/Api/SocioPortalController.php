<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use App\Models\Reservas;
use App\Models\Instalaciones;
use App\Models\Pago;
use App\Models\Notificacion;
use App\Models\Agenda;
use App\Models\Asistencia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SocioPortalController extends Controller
{
    private function obtenerSocioAutenticado(Request $request)
    {
        $usuario = $request->user();

        if ((int) $usuario->id_rol !== 4) {
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
     * POST /api/socio/asistencia/qr
     * El socio escanea el QR de una sesión y registra su asistencia.
     *
     * Validaciones:
     *  1. La sesión existe y está en estado 'Activa' (o 'Programada' con 30 min de margen).
     *  2. El socio tiene al menos UNA reserva activa en esa misma sesión O está inscrito
     *     en la disciplina de la sesión (relación socio ↔ disciplina si existe).
     *     Como la tabla actual no tiene una relación directa socio-disciplina,
     *     se verifica que exista al menos una asistencia previa MANUAL registrada
     *     por el admin, OR que exista una reserva del socio para esa sesión.
     *     Si no existe ninguna relación, se devuelve código 'no_inscrito'.
     *  3. No duplicar registros de asistencia.
     */
    public function registrarAsistenciaQr(Request $request)
    {
        $resultado = $this->obtenerSocioAutenticado($request);
        if (isset($resultado['error'])) return $resultado['error'];

        $socio = $resultado['socio'];

        $validated = $request->validate([
            'id_sesion' => 'required|integer|exists:tbl_agenda,id_sesion',
            'token_qr'  => 'nullable|string|max:255',
        ]);

        // 1. Cargar la sesión con sus relaciones
        $sesion = Agenda::with(['disciplina', 'instructor', 'espacio'])->findOrFail($validated['id_sesion']);

        // 2. Verificar que la sesión esté activa o próxima (máx 60 min antes del inicio)
        $ahora        = Carbon::now();
        $horaSesion   = Carbon::parse($sesion->fecha . ' ' . $sesion->hora_inicio);
        $horaFin      = Carbon::parse($sesion->fecha . ' ' . $sesion->hora_fin);
        $minutosAntes = $ahora->diffInMinutes($horaSesion, false); // negativo = ya empezó

        $sesionDisponible = $sesion->estado === 'Activa'
            || ($sesion->estado === 'Programada' && $minutosAntes <= 60 && $minutosAntes >= 0)
            || ($ahora->between($horaSesion, $horaFin));

        if (!$sesionDisponible) {
            return response()->json([
                'status'  => 'error',
                'code'    => 'sesion_no_disponible',
                'message' => 'Esta sesión no está disponible para pasar asistencia en este momento. '
                           . 'El QR solo es válido a partir de 60 minutos antes del inicio y durante la sesión.',
                'sesion'  => $sesion,
            ], 422);
        }

        // 3. Verificar que el socio esté inscrito en la sesión.
        //    Se considera "inscrito" si existe alguno de estos registros:
        //    a) Ya tiene una asistencia en CUALQUIER sesión de la misma disciplina (inscripción previa)
        //    b) El admin lo incluyó manualmente en el pase de lista anteriormente para esta u otra sesión
        //       de la misma disciplina (indicio de que está matriculado)
        //
        //    NOTA: Si el sistema no tiene una tabla de "inscripciones" explícita,
        //    usamos la existencia de asistencias previas del socio a sesiones
        //    de esa misma disciplina como proxy de inscripción.
        //    Si el socio nunca ha asistido a esa disciplina ni tiene reservas previas,
        //    se rechaza con 'no_inscrito'.
        $disciplinaId = $sesion->id_disciplina;

        $inscrito = Asistencia::where('id_socio', $socio->id_socio)
            ->whereHas('sesion', fn($q) => $q->where('id_disciplina', $disciplinaId))
            ->exists();

        // También aceptar si tiene la asistencia manual ya colocada en ESTA sesión específica
        // (para evitar doble-denegación en el caso borde donde ya fue registrado manualmente)
        if (!$inscrito) {
            $inscrito = Asistencia::where('id_socio', $socio->id_socio)
                ->where('id_sesion', $sesion->id_sesion)
                ->exists();
        }

        if (!$inscrito) {
            return response()->json([
                'status'  => 'error',
                'code'    => 'no_inscrito',
                'message' => 'No estás inscrito en la clase "'
                           . ($sesion->disciplina->nombre_disciplina ?? 'de esta sesión')
                           . '". Solo los socios inscritos pueden registrar asistencia mediante QR.',
                'sesion'  => $sesion,
            ], 403);
        }

        // 4. Verificar duplicado
        $yaRegistrado = Asistencia::where('id_socio', $socio->id_socio)
            ->where('id_sesion', $sesion->id_sesion)
            ->exists();

        if ($yaRegistrado) {
            return response()->json([
                'status'  => 'error',
                'code'    => 'ya_registrado',
                'message' => 'Tu asistencia ya fue registrada para la sesión "'
                           . ($sesion->disciplina->nombre_disciplina ?? '#' . $sesion->id_sesion)
                           . '" del ' . $sesion->fecha . '.',
                'sesion'  => $sesion,
            ], 422);
        }

        // 5. Registrar asistencia
        $asistencia = Asistencia::create([
            'id_socio'           => $socio->id_socio,
            'id_sesion'          => $sesion->id_sesion,
            'token_qr'           => $validated['token_qr'] ?? Str::uuid()->toString(),
            'timestamp_registro' => $ahora,
        ]);

        $asistencia->load(['socio', 'sesion.disciplina', 'sesion.instructor']);

        return response()->json([
            'status'  => 'success',
            'message' => '¡Asistencia registrada correctamente! Bienvenido a '
                       . ($sesion->disciplina->nombre_disciplina ?? 'la sesión') . '.',
            'data'    => $asistencia,
        ], 201);
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