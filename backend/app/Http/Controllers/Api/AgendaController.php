<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Agenda;

class AgendaController extends Controller
{
    /**
     * GET /api/agenda
     * Lista sesiones con filtro opcional por instructor
     */
    public function index(Request $request)
    {
        $query = Agenda::with(['disciplina', 'instructor', 'espacio', 'asistencias.socio']);

        if ($request->filled('id_instructor')) {
            $query->where('id_instructor', $request->id_instructor);
        }

        if ($request->filled('id_usuario')) {
            $instructor = \Illuminate\Support\Facades\DB::table('tbl_instructores')
                ->where('id_usuario', $request->id_usuario)
                ->first();
            if ($instructor) {
                $query->where('id_instructor', $instructor->id_instructor);
            } else {
                // If user has no instructor profile, return empty
                return response()->json([
                    'status' => 'success',
                    'data' => []
                ]);
            }
        }

        $sesiones = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $sesiones
        ]);
    }

    /**
     * GET /api/agenda/{id}
     * Muestra el detalle de una sesión específica
     */
    public function show($id)
    {
        $sesion = Agenda::with(['disciplina', 'instructor', 'espacio', 'asistencias.socio'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $sesion
        ]);
    }

    /**
     * POST /api/agenda
     * Crea una nueva sesión
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_disciplina'  => 'required|exists:cat_disciplinas,id_disciplina',
            'id_instructor'  => 'required|exists:tbl_instructores,id_instructor',
            'id_espacio'     => 'required|exists:tbl_instalaciones,id_espacio',
            'fecha'          => 'required|date',
            'hora_inicio'    => 'required',
            'hora_fin'       => 'required|after:hora_inicio',
            'cupo_maximo'    => 'nullable|integer|min:1',
            'estado'         => 'required|in:Programada,Activa,Cancelada,Finalizada',
        ]);

        $sesion = Agenda::create($validated);
        $sesion->load(['disciplina', 'instructor', 'espacio']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Sesión creada correctamente',
            'data'    => $sesion
        ], 201);
    }

    /**
     * PUT /api/agenda/{id}
     * Actualiza una sesión existente
     */
    public function update(Request $request, $id)
    {
        $sesion = Agenda::findOrFail($id);

        $validated = $request->validate([
            'id_disciplina'  => 'sometimes|exists:cat_disciplinas,id_disciplina',
            'id_instructor'  => 'sometimes|exists:tbl_instructores,id_instructor',
            'id_espacio'     => 'sometimes|exists:tbl_instalaciones,id_espacio',
            'fecha'          => 'sometimes|date',
            'hora_inicio'    => 'sometimes',
            'hora_fin'       => 'sometimes',
            'cupo_maximo'    => 'nullable|integer|min:1',
            'estado'         => 'sometimes|in:Programada,Activa,Cancelada,Finalizada',
        ]);

        $sesion->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Sesión actualizada correctamente',
            'data'    => $sesion->load(['disciplina', 'instructor', 'espacio'])
        ]);
    }

    /**
     * DELETE /api/agenda/{id}
     * Elimina una sesión
     */
    public function destroy($id)
    {
        $sesion = Agenda::findOrFail($id);
        $sesion->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Sesión eliminada correctamente'
        ]);
    }

    /**
     * GET /api/agenda/catalogo/disciplinas
     * Devuelve catálogo de disciplinas activas para los selects del frontend
     */
    public function getDisciplinas()
    {
        $disciplinas = \App\Models\CatDisciplina::where('activa', true)
            ->select('id_disciplina', 'nombre_disciplina', 'categoria')
            ->orderBy('nombre_disciplina')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $disciplinas
        ]);
    }

    /**
     * GET /api/agenda/catalogo/instructores
     * Devuelve instructores activos para los selects del frontend
     */
    public function getInstructores()
    {
        $instructores = \App\Models\Instructor::where('estatus', 'Activo')
            ->select('id_instructor', 'nombre_completo', 'especialidad')
            ->orderBy('nombre_completo')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $instructores
        ]);
    }
}