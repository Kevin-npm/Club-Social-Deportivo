<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = User::where('email', $request->email)
            ->where('activo', true)
            ->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        if ($request->password !== $usuario->password_hash) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $usuario->update([
            'ultimo_login_at' => now(),
        ]);

        $token = $usuario->createToken('clubmanager360-token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id_usuario' => $usuario->id_usuario,
                'email' => $usuario->email,
                'id_rol' => $usuario->id_rol,
                'role' => $this->mapRole($usuario->id_rol),
            ]
        ]);
    }

    public function me(Request $request)
    {
        $usuario = $request->user();

        return response()->json([
            'user' => [
                'id_usuario' => $usuario->id_usuario,
                'email' => $usuario->email,
                'id_rol' => $usuario->id_rol,
                'role' => $this->mapRole($usuario->id_rol),
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    private function mapRole($idRol)
    {
        return match ((int) $idRol) {
            1 => 'admin',
            2 => 'socio',
            3 => 'instructor',
            default => 'usuario',
        };
    }
}