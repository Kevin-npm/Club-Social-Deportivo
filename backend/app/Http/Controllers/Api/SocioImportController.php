<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SocioImportController extends Controller
{
    public function import(Request $request)
    {
        set_time_limit(0);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!$handle) {
            return response()->json([
                'message' => 'No se pudo leer el archivo.'
            ], 400);
        }

        $header = fgetcsv($handle, 10000, ',');

        if (!$header) {
            fclose($handle);
            return response()->json([
                'message' => 'El CSV está vacío o no tiene encabezados.'
            ], 400);
        }

        $header = array_map(function ($value) {
            $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
            return strtolower(trim($value));
        }, $header);

        $sociosColumns = Schema::getColumnListing('tbl_socios');
        $usuariosColumns = Schema::getColumnListing('tbl_usuarios');

        $required = ['nombre', 'apellidos', 'email'];

        foreach ($required as $column) {
            if (!in_array($column, $header)) {
                fclose($handle);

                return response()->json([
                    'message' => "Falta la columna requerida: {$column}"
                ], 422);
            }
        }

        $insertados = 0;
        $actualizados = 0;
        $errores = [];
        $fila = 1;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle, 10000, ',')) !== false) {
                $fila++;

                if (count($row) !== count($header)) {
                    $errores[] = [
                        'fila' => $fila,
                        'error' => 'La fila no coincide con el número de columnas.'
                    ];
                    continue;
                }

                $data = array_combine($header, $row);

                $email = strtolower(trim($data['email'] ?? ''));
                $nombre = trim($data['nombre'] ?? '');
                $apellidos = trim($data['apellidos'] ?? '');

                if (!$email || !$nombre || !$apellidos) {
                    $errores[] = [
                        'fila' => $fila,
                        'error' => 'Nombre, apellidos y email son obligatorios.'
                    ];
                    continue;
                }

                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $errores[] = [
                        'fila' => $fila,
                        'error' => "Email inválido: {$email}"
                    ];
                    continue;
                }

                $usuario = DB::table('tbl_usuarios')
                    ->where('email', $email)
                    ->first();

                if (!$usuario) {
                    $usuarioData = [
                        'email' => $email,
                        'password_hash' => $data['password_hash'] ?? 'user123',
                        'id_rol' => 2,
                        'activo' => true,
                        'ultimo_login_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $usuarioData = array_intersect_key(
                        $usuarioData,
                        array_flip($usuariosColumns)
                    );

                    $idUsuario = DB::table('tbl_usuarios')->insertGetId($usuarioData, 'id_usuario');
                } else {
                    $idUsuario = $usuario->id_usuario;
                }

                $socioData = [
                    'id_usuario' => $idUsuario,
                    'nombre' => $nombre,
                    'apellidos' => $apellidos,
                    'correo' => $email,
                    'telefono' => $data['telefono'] ?? $data['telefono_celular'] ?? null,
                    'fecha_nacimiento' => $this->parseDate($data['fecha_nacimiento'] ?? null),
                    'genero' => $data['genero'] ?? 'No especifica',
                    'tipo_membresia' => $data['tipo_membresia'] ?? $data['tipo_accion'] ?? 'Accionista',
                    'modalidad' => $data['modalidad'] ?? 'Individual',
                    'numero_documento' => $data['numero_documento'] ?? $data['numero_accion'] ?? null,
                    'fecha_inicio_vigencia' => $this->parseDate($data['fecha_inicio_vigencia'] ?? null) ?? now()->toDateString(),
                    'fecha_fin_vigencia' => $this->parseDate($data['fecha_fin_vigencia'] ?? null) ?? now()->addYear()->toDateString(),
                    'estatus_financiero' => $data['estatus_financiero'] ?? $data['estatus_accion'] ?? 'Vigente',
                    'es_titular' => $this->parseBoolean($data['es_titular'] ?? true),
                    'id_titular_fk' => null,
                    'activo' => $this->parseBoolean($data['activo'] ?? true),
                    'faltas' => isset($data['faltas']) ? (int) $data['faltas'] : 0,
                    'updated_at' => now(),
                ];

                $socioData = array_intersect_key(
                    $socioData,
                    array_flip($sociosColumns)
                );

                $socioExistente = DB::table('tbl_socios')
                    ->where('id_usuario', $idUsuario)
                    ->first();

                if ($socioExistente) {
                    DB::table('tbl_socios')
                        ->where('id_socio', $socioExistente->id_socio)
                        ->update($socioData);

                    $actualizados++;
                } else {
                    $socioData['created_at'] = now();

                    $socioData = array_intersect_key(
                        $socioData,
                        array_flip($sociosColumns)
                    );

                    DB::table('tbl_socios')->insert($socioData);

                    $insertados++;
                }
            }

            fclose($handle);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Importación completada.',
                'insertados' => $insertados,
                'actualizados' => $actualizados,
                'errores' => $errores,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            if (is_resource($handle)) {
                fclose($handle);
            }

            Log::error('Error al importar socios: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Error crítico durante la importación.',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }

    public function exportCsv()
    {
        $fileName = 'socios_exportados_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename={$fileName}",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, [
                'id_socio',
                'id_usuario',
                'nombre',
                'apellidos',
                'email',
                'telefono',
                'fecha_nacimiento',
                'genero',
                'tipo_membresia',
                'modalidad',
                'numero_documento',
                'fecha_inicio_vigencia',
                'fecha_fin_vigencia',
                'estatus_financiero',
                'activo',
                'faltas',
            ]);

            DB::table('tbl_socios')
                ->leftJoin('tbl_usuarios', 'tbl_socios.id_usuario', '=', 'tbl_usuarios.id_usuario')
                ->select(
                    'tbl_socios.id_socio',
                    'tbl_socios.id_usuario',
                    'tbl_socios.nombre',
                    'tbl_socios.apellidos',
                    'tbl_usuarios.email',
                    'tbl_socios.telefono',
                    'tbl_socios.fecha_nacimiento',
                    'tbl_socios.genero',
                    'tbl_socios.tipo_membresia',
                    'tbl_socios.modalidad',
                    'tbl_socios.numero_documento',
                    'tbl_socios.fecha_inicio_vigencia',
                    'tbl_socios.fecha_fin_vigencia',
                    'tbl_socios.estatus_financiero',
                    'tbl_socios.activo',
                    'tbl_socios.faltas'
                )
                ->orderBy('tbl_socios.id_socio')
                ->chunk(500, function ($socios) use ($handle) {
                    foreach ($socios as $socio) {
                        fputcsv($handle, [
                            $socio->id_socio,
                            $socio->id_usuario,
                            $socio->nombre,
                            $socio->apellidos,
                            $socio->email,
                            $socio->telefono,
                            $socio->fecha_nacimiento,
                            $socio->genero,
                            $socio->tipo_membresia,
                            $socio->modalidad,
                            $socio->numero_documento,
                            $socio->fecha_inicio_vigencia,
                            $socio->fecha_fin_vigencia,
                            $socio->estatus_financiero,
                            $socio->activo ? 'true' : 'false',
                            $socio->faltas,
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }

    public function templateCsv()
    {
        $fileName = 'plantilla_importacion_socios.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename={$fileName}",
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, [
                'nombre',
                'apellidos',
                'email',
                'telefono',
                'fecha_nacimiento',
                'genero',
                'tipo_membresia',
                'modalidad',
                'numero_documento',
                'fecha_inicio_vigencia',
                'fecha_fin_vigencia',
                'estatus_financiero',
                'activo',
                'faltas',
            ]);

            fputcsv($handle, [
                'Miguel',
                'Torres',
                'miguel.torres@test.com',
                '4431234567',
                '1998-08-12',
                'Masculino',
                'Accionista',
                'Individual',
                'SOC-001',
                '2026-05-25',
                '2027-05-25',
                'Vigente',
                'true',
                '0',
            ]);

            fclose($handle);
        }, 200, $headers);
    }

    private function parseDate($value)
    {
        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseBoolean($value)
    {
        if (is_bool($value)) {
            return $value;
        }

        $value = strtolower(trim((string) $value));

        return in_array($value, ['1', 'true', 'si', 'sí', 'yes', 'activo'], true);
    }
}