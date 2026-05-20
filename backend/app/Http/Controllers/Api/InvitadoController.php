<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvitadoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invitado::with('socio:id_socio,nombre,apellidos')
            ->orderByDesc('created_at');

        if ($request->has('fecha')) {
            $query->whereDate('fecha_registro', $request->query('fecha'));
        }

        if ($request->has('id_socio')) {
            $query->where('id_socio', $request->query('id_socio'));
        }

        if ($request->has('estatus')) {
            $query->where('estatus', $request->query('estatus'));
        }

        if ($request->has('query')) {
            $search = $request->query('query');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'LIKE', "%{$search}%")
                  ->orWhere('apellidos', 'LIKE', "%{$search}%");
            });
        }

        $invitados = $query->get();

        return response()->json([
            'message' => 'Lista de invitados obtenida correctamente',
            'data' => $invitados,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_socio' => 'required|integer|exists:tbl_socios,id_socio',
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:120',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $hoy = now()->toDateString();

        $invitadosHoy = Invitado::where('id_socio', $validated['id_socio'])
            ->whereDate('fecha_registro', $hoy)
            ->whereIn('estatus', ['Pendiente', 'Autorizado', 'Usado'])
            ->count();

        if ($invitadosHoy >= 2) {
            return response()->json([
                'message' => 'El socio ya tiene 2 invitados registrados el día de hoy.',
            ], 422);
        }

        $validated['fecha_registro'] = $hoy;
        $validated['estatus'] = 'Pendiente';

        $invitado = Invitado::create($validated);
        $invitado->load('socio:id_socio,nombre,apellidos');

        return response()->json([
            'message' => 'Invitado registrado correctamente',
            'data' => $invitado,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $invitado = Invitado::with('socio:id_socio,nombre,apellidos')->find($id);

        if (!$invitado) {
            return response()->json([
                'message' => 'Invitado no encontrado',
            ], 404);
        }

        return response()->json([
            'message' => 'Invitado encontrado correctamente',
            'data' => $invitado,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $invitado = Invitado::find($id);

        if (!$invitado) {
            return response()->json([
                'message' => 'Invitado no encontrado',
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:120',
            'estatus' => [
                'sometimes',
                'required',
                Rule::in(['Pendiente', 'Autorizado', 'Usado', 'Expirado']),
            ],
            'observaciones' => 'nullable|string|max:500',
        ]);

        $invitado->update($validated);
        $invitado->load('socio:id_socio,nombre,apellidos');

        return response()->json([
            'message' => 'Invitado actualizado correctamente',
            'data' => $invitado,
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $invitado = Invitado::find($id);

        if (!$invitado) {
            return response()->json([
                'message' => 'Invitado no encontrado',
            ], 404);
        }

        $invitado->delete();

        return response()->json([
            'message' => 'Invitado eliminado correctamente',
        ], 200);
    }

    public function marcarAsistencia(string $id): JsonResponse
    {
        $invitado = Invitado::find($id);

        if (!$invitado) {
            return response()->json([
                'message' => 'Invitado no encontrado',
            ], 404);
        }

        if ($invitado->estatus === 'Usado') {
            return response()->json([
                'message' => 'Este invitado ya registró su asistencia.',
            ], 422);
        }

        if ($invitado->estatus === 'Expirado') {
            return response()->json([
                'message' => 'Este invitado ya expiró. Su registro era válido solo para el día ' . $invitado->fecha_registro->format('d/m/Y'),
            ], 422);
        }

        $invitado->update(['estatus' => 'Usado']);

        return response()->json([
            'message' => 'Asistencia marcada correctamente',
            'data' => $invitado->load('socio:id_socio,nombre,apellidos'),
        ], 200);
    }

    public function porSocio(string $idSocio): JsonResponse
    {
        $socio = Socio::find($idSocio);

        if (!$socio) {
            return response()->json([
                'message' => 'Socio no encontrado',
            ], 404);
        }

        $invitados = Invitado::where('id_socio', $idSocio)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Invitados del socio obtenidos correctamente',
            'data' => $invitados,
        ], 200);
    }

    public function expirarAntiguos(): JsonResponse
    {
        $hoy = now()->toDateString();

        $actualizados = Invitado::whereDate('fecha_registro', '<', $hoy)
            ->whereIn('estatus', ['Pendiente', 'Autorizado'])
            ->update(['estatus' => 'Expirado']);

        return response()->json([
            'message' => "Se expiraron {$actualizados} invitados.",
            'data' => ['expirados' => $actualizados],
        ], 200);
    }
}
