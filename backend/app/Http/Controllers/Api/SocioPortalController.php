<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use App\Models\Reservas;
use App\Models\Pago;
use App\Models\Notificacion;
use Illuminate\Http\Request;

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
}