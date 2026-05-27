<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        $role = match ((int) $user->id_rol) {
            1 => 'admin',
            2 => 'socio',
            3 => 'instructor',
            default => 'usuario',
        };

        if (!in_array($role, $roles)) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a este recurso'
            ], 403);
        }

        return $next($request);
    }
}