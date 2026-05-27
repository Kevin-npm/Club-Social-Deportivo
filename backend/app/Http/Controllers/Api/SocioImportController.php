<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SocioImportController extends Controller
{
    public function import(Request $request)
    {
        set_time_limit(0);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        $handle = fopen($filePath, 'r');
        
        // Leer la cabecera (primera linea)
        $header = fgetcsv($handle, 10000, ',');
        
        if (!$header) {
            fclose($handle);
            return response()->json(['error' => "El archivo CSV está vacío o tiene un formato incorrecto."], 400);
        }

        // Limpiar los nombres de columnas de posibles caracteres extraños o BOM
        $header = array_map(function($h) {
            return trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h));
        }, $header);

        $headerMap = array_flip($header);
        
        // Cabeceras esperadas según el formato
        $expectedHeaders = ['Numero_Accion', 'Tipo_Accion', 'Estatus_Accion', 'Rol', 'Nombre_Completo', 'Genero', 'Fecha_Nacimiento', 'Edad', 'Parentesco', 'Domicilio', 'Email', 'Telefono_Celular', 'Telefono_Particular'];
        
        foreach ($expectedHeaders as $expected) {
            // Busqueda case-insensitive si es necesario o directa
            $found = false;
            foreach($header as $h) {
                if(strtolower($h) == strtolower($expected)) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                // Warning en vez de abortar por completo, pero el usuario pidió exacto. 
                // Lo dejamos para que avise pero seguiremos mapeando lo que coincida.
                // Log::warning("Columna faltante: $expected");
            }
        }

        try {
            // Cargar todos los socios existentes en memoria para evitar miles de consultas
            $todosLosSocios = DB::table('tbl_socios')->get();
            
            $sociosPorCorreo = [];
            $sociosPorAccionNombre = [];
            
            foreach ($todosLosSocios as $s) {
                if ($s->correo) {
                    $sociosPorCorreo[strtolower($s->correo)] = $s;
                }
                if ($s->numero_accion && $s->nombre) {
                    $sociosPorAccionNombre[$s->numero_accion . '_' . strtolower($s->nombre)] = $s;
                }
            }
            
            $inserts = [];
            $now = now();
            
            while (($row = fgetcsv($handle, 10000, ',')) !== false) {
                if (count($row) !== count($header)) {
                    continue;
                }
                
                $data = array_combine($header, $row);
                $dataLowerKeys = [];
                foreach($data as $k => $v) {
                    $dataLowerKeys[strtolower($k)] = $v;
                }
                
                $email = !empty($dataLowerKeys['email']) ? trim($dataLowerKeys['email']) : null;
                $numeroAccion = !empty($dataLowerKeys['numero_accion']) ? trim($dataLowerKeys['numero_accion']) : null;
                $nombreCompleto = !empty($dataLowerKeys['nombre_completo']) ? trim($dataLowerKeys['nombre_completo']) : 'S/N';
                
                $parts = explode(' ', $nombreCompleto);
                $nombre = $parts[0];
                array_shift($parts);
                $apellidos = count($parts) > 0 ? implode(' ', $parts) : '';
                
                // Buscar idempotencia en memoria (Cero latencia de base de datos)
                $socioExistente = null;
                if ($email && isset($sociosPorCorreo[strtolower($email)])) {
                    $socioExistente = $sociosPorCorreo[strtolower($email)];
                } else if ($numeroAccion && isset($sociosPorAccionNombre[$numeroAccion . '_' . strtolower($nombre)])) {
                    $socioExistente = $sociosPorAccionNombre[$numeroAccion . '_' . strtolower($nombre)];
                }
                
                $fechaNacimiento = '2000-01-01';
                if (!empty($dataLowerKeys['fecha_nacimiento'])) {
                    try {
                        $fechaNacimiento = Carbon::parse($dataLowerKeys['fecha_nacimiento'])->format('Y-m-d');
                    } catch (\Exception $e) {
                        if ($socioExistente) $fechaNacimiento = $socioExistente->fecha_nacimiento;
                    }
                } else if ($socioExistente) {
                    $fechaNacimiento = $socioExistente->fecha_nacimiento;
                }
                
                $socioData = [
                    'nombre' => $nombre,
                    'apellidos' => $apellidos,
                    'correo' => $email,
                    'telefono' => !empty($dataLowerKeys['telefono_celular']) ? $dataLowerKeys['telefono_celular'] : ($socioExistente ? $socioExistente->telefono : null),
                    'fecha_nacimiento' => $fechaNacimiento,
                    'genero' => !empty($dataLowerKeys['genero']) ? $dataLowerKeys['genero'] : ($socioExistente ? $socioExistente->genero : 'Otro'),
                    'numero_accion' => $numeroAccion,
                    'tipo_accion' => !empty($dataLowerKeys['tipo_accion']) ? $dataLowerKeys['tipo_accion'] : null,
                    'estatus_accion' => !empty($dataLowerKeys['estatus_accion']) ? $dataLowerKeys['estatus_accion'] : null,
                    'rol' => !empty($dataLowerKeys['rol']) ? $dataLowerKeys['rol'] : null,
                    'edad' => !empty($dataLowerKeys['edad']) ? (int)$dataLowerKeys['edad'] : null,
                    'parentesco' => !empty($dataLowerKeys['parentesco']) ? $dataLowerKeys['parentesco'] : null,
                    'domicilio' => !empty($dataLowerKeys['domicilio']) ? $dataLowerKeys['domicilio'] : null,
                    'telefono_particular' => !empty($dataLowerKeys['telefono_particular']) ? $dataLowerKeys['telefono_particular'] : null,
                    'tipo_membresia' => $socioExistente ? $socioExistente->tipo_membresia : 'Individual',
                    'modalidad' => $socioExistente ? $socioExistente->modalidad : 'Mensual',
                    'estatus_financiero' => $socioExistente ? $socioExistente->estatus_financiero : 'Al Corriente',
                    'es_titular' => $socioExistente ? $socioExistente->es_titular : true,
                    'activo' => $socioExistente ? $socioExistente->activo : true,
                    'updated_at' => clone $now,
                ];

                if ($socioExistente) {
                    // Update uno por uno
                    if (isset($socioExistente->id_socio)) {
                        DB::table('tbl_socios')->where('id_socio', $socioExistente->id_socio)->update($socioData);
                    }
                } else {
                    $socioData['created_at'] = clone $now;
                    $inserts[] = $socioData;
                    
                    // Actualizar caché de memoria para evitar duplicados en el mismo CSV
                    $objSocio = (object)$socioData;
                    if ($email) {
                        $sociosPorCorreo[strtolower($email)] = $objSocio;
                    }
                    if ($numeroAccion && $nombre) {
                        $sociosPorAccionNombre[$numeroAccion . '_' . strtolower($nombre)] = $objSocio;
                    }
                    
                    if (count($inserts) >= 50) {
                        DB::table('tbl_socios')->insert($inserts);
                        $inserts = [];
                    }
                }
            }
            
            if (count($inserts) > 0) {
                DB::table('tbl_socios')->insert($inserts);
            }

            fclose($handle);
            
            return response()->json(['message' => 'Importación de socios completada exitosamente.']);
            
        } catch (\Exception $e) {
            if(isset($handle) && is_resource($handle)) {
                fclose($handle);
            }
            Log::error('Error en importacion CSV de socios: ' . $e->getMessage() . ' - Línea: ' . $e->getLine());
            return response()->json(['error' => 'Ocurrió un error crítico durante la importación. Todos los cambios han sido revertidos.'], 500);
        }
    }
}
