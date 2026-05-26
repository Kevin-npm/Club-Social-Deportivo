<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Models\Socio;
use Illuminate\Http\Request;

class NotificacionesController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        $socio = Socio::where(
            'id_usuario',
            $usuario->id_usuario
        )->first();

        if (!$socio) {
            return response()->json([
                'status' => 'success',
                'data' => [],
                'total' => 0,
                'no_leidas' => 0,
                'message' => 'El usuario autenticado no tiene socio asociado.',
            ]);
        }

        $notificaciones = Notificacion::where(
            'id_socio',
            $socio->id_socio
        )
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notificaciones,
            'total' => $notificaciones->count(),
            'no_leidas' => $notificaciones
                ->where('leido_boolean', false)
                ->count(),
        ]);
    }

    public function marcarLeida(Request $request, $id)
    {
        $usuario = $request->user();

        $socio = Socio::where(
            'id_usuario',
            $usuario->id_usuario
        )->first();

        if (!$socio) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene socio asociado.',
            ], 404);
        }

        $notificacion = Notificacion::where(
            'id_notificacion',
            $id
        )
        ->where(
            'id_socio',
            $socio->id_socio
        )
        ->first();

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada.',
            ], 404);
        }

        $notificacion->update([
            'leido_boolean' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notificación marcada como leída.',
            'data' => $notificacion,
        ]);
    }
}