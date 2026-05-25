<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LudotecaController extends Controller
{
    public function registrarIngreso(Request $request)
    {
        $ninoId = $request->input('id_nino');
        $tutorId = $request->input('id_tutor');

        try {
            // 1. Buscar al niño en la base de datos
            $nino = DB::table('tbl_socios')->where('id_socio', $ninoId)->first();
            if (!$nino) {
                return response()->json(['status' => 'error', 'message' => 'El ID del niño no existe.'], 404);
            }

            // 2. Buscar al tutor
            $tutor = DB::table('tbl_socios')->where('id_socio', $tutorId)->first();
            if (!$tutor) {
                return response()->json(['status' => 'error', 'message' => 'El ID del tutor no existe.'], 404);
            }

            // 3. CALCULAR LA EDAD EXACTA
            $edad = Carbon::parse($nino->fecha_nacimiento)->age;
            
            // 4. VALIDACIÓN DE REGLAMENTO (3 a 6 años)
            if ($edad < 3 || $edad > 6) {
                return response()->json([
                    'status' => 'error', 
                    'message' => "ACCESO DENEGADO: El menor tiene {$edad} años. El reglamento solo permite de 3 a 6 años."
                ], 400);
            }

            // 5. Validar que no esté ya jugando adentro
            $activo = DB::table('tbl_ludoteca')
                ->where('id_nino_fk', $ninoId)
                ->where('estado', 'Activo')
                ->first();
            
            if ($activo) {
                return response()->json(['status' => 'error', 'message' => 'El niño ya se encuentra dentro de la ludoteca.'], 400);
            }

            // 6. Si pasa todo, lo registramos en la Ludoteca
            DB::table('tbl_ludoteca')->insert([
                'id_nino_fk' => $ninoId,
                'id_tutor_fk' => $tutorId,
                'estado' => 'Activo',
                'timestamp_entrada' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['status' => 'success', 'message' => 'Ingreso autorizado y registrado.']);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error de servidor: ' . $e->getMessage()], 500);
        }
    }

    public function registrarSalida(Request $request)
    {
        $ninoId = $request->input('id_nino');

        try {
            // Buscamos si el niño está adentro
            $activo = DB::table('tbl_ludoteca')
                ->where('id_nino_fk', $ninoId)
                ->where('estado', 'Activo')
                ->first();

            if (!$activo) {
                return response()->json(['status' => 'error', 'message' => 'El niño no está en ludoteca o ya salió.'], 404);
            }

            // Cambiamos su estado a Finalizado para que pueda volver a entrar después
            DB::table('tbl_ludoteca')
                ->where('id_nino_fk', $ninoId)
                ->where('estado', 'Activo')
                ->update([
                    'estado' => 'Finalizado',
                    'updated_at' => now()
                ]);

            return response()->json(['status' => 'success', 'message' => 'Salida registrada correctamente en BD.']);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error de servidor: ' . $e->getMessage()], 500);
        }
    }

    public function miStatus(Request $request): JsonResponse
    {
        $idSocio = $request->query('id_socio');

        if (!$idSocio) {
            return response()->json(['status' => 'empty'], 200);
        }

        $hijos = Socio::where('id_titular_fk', $idSocio)->pluck('id_socio');

        if ($hijos->isEmpty()) {
            return response()->json(['status' => 'empty'], 200);
        }

        $activos = DB::table('tbl_ludoteca')
            ->join('tbl_socios', 'tbl_ludoteca.id_nino_fk', '=', 'tbl_socios.id_socio')
            ->whereIn('tbl_ludoteca.id_nino_fk', $hijos)
            ->where('tbl_ludoteca.estado', 'Activo')
            ->whereNotNull('tbl_ludoteca.timestamp_entrada')
            ->select(
                'tbl_ludoteca.id_nino_fk',
                'tbl_socios.nombre',
                'tbl_socios.apellidos',
                'tbl_ludoteca.timestamp_entrada'
            )
            ->get();

        if ($activos->isEmpty()) {
            return response()->json(['status' => 'empty'], 200);
        }

        $result = [];
        $expirados = 0;

        foreach ($activos as $item) {
            $timestamp = $item->timestamp_entrada;
            $segundosTranscurridos = (int) (time() - strtotime($timestamp));

            if ($segundosTranscurridos >= 7200) {
                DB::table('tbl_ludoteca')
                    ->where('id_nino_fk', $item->id_nino_fk)
                    ->where('estado', 'Activo')
                    ->update(['estado' => 'Finalizado', 'updated_at' => now()]);
                $expirados++;
                continue;
            }

            $item->segundos_transcurridos = $segundosTranscurridos;
            $result[] = $item;
        }

        if (empty($result) && $expirados > 0) {
            return response()->json([
                'status' => 'expirado',
                'message' => 'Todos los niños han superado las 2 horas de límite.',
            ], 200);
        }

        return response()->json([
            'status' => 'success',
            'data' => $result,
            'expirados' => $expirados,
        ], 200);
    }

    public function ajustarTiempo(Request $request): JsonResponse
    {
        $idNino = $request->input('id_nino');
        $minutos = (int) $request->input('minutos', 0);

        if (!$idNino || $minutos <= 0) {
            return response()->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        $activo = DB::table('tbl_ludoteca')
            ->where('id_nino_fk', $idNino)
            ->where('estado', 'Activo')
            ->first();

        if (!$activo) {
            return response()->json(['status' => 'error', 'message' => 'El niño no está en ludoteca.'], 404);
        }

        $nuevaEntrada = Carbon::parse($activo->timestamp_entrada)->subMinutes($minutos);

        DB::table('tbl_ludoteca')
            ->where('id_ludoteca', $activo->id_ludoteca)
            ->update([
                'timestamp_entrada' => $nuevaEntrada,
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => "Tiempo ajustado: +{$minutos} minutos.",
            'timestamp_entrada' => $nuevaEntrada->toISOString(),
        ], 200);
    }

    public function resetTiempo(Request $request): JsonResponse
    {
        $idNino = $request->input('id_nino');

        if (!$idNino) {
            return response()->json(['status' => 'error', 'message' => 'ID de niño requerido.'], 400);
        }

        $activo = DB::table('tbl_ludoteca')
            ->where('id_nino_fk', $idNino)
            ->where('estado', 'Activo')
            ->first();

        if (!$activo) {
            return response()->json(['status' => 'error', 'message' => 'El niño no está en ludoteca.'], 404);
        }

        DB::table('tbl_ludoteca')
            ->where('id_ludoteca', $activo->id_ludoteca)
            ->update([
                'timestamp_entrada' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tiempo reiniciado a 0.',
            'timestamp_entrada' => now()->toISOString(),
        ], 200);
    }
}