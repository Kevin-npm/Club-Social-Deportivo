<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionesController extends Controller
{
    public function index(Request $request)
    {
        $idSocio = $request->query('id_socio');

        if (! $idSocio) {
            return response()->json([
                'status' => 'error',
                'message' => 'id_socio es requerido.',
            ], 422);
        }

        $notificaciones = Notificacion::where('id_socio', $idSocio)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notificaciones,
        ]);
    }

    public function marcarComoLeido($id)
    {
        $notificacion = Notificacion::findOrFail($id);

        $notificacion->marcarComoLeida();

        return response()->json([
            'status' => 'success',
            'message' => 'Notificación marcada como leída',
        ]);
    }
}