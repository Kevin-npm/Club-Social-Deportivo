<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\Request;

class UserSettingsController extends Controller
{
    public function show(Request $request)
    {
        $usuario = $request->user();

        $settings = UserSetting::firstOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            [
                'email_notifications' => true,
                'system_alerts' => true,
                'security_alerts' => true,
                'compact_mode' => false,
                'theme' => 'dark',
                'accent' => 'yellow',
            ]
        );

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $usuario = $request->user();

        $validated = $request->validate([
            'email_notifications' => 'required|boolean',
            'system_alerts' => 'required|boolean',
            'security_alerts' => 'required|boolean',
            'compact_mode' => 'required|boolean',
            'theme' => 'required|string|in:dark,light',
            'accent' => 'required|string|in:yellow,blue,green',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Configuración actualizada correctamente.',
            'data' => $settings,
        ]);
    }
}