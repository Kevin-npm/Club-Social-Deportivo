<?php

namespace App\Http\Controllers;

use App\Models\Torneo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class TorneoController extends Controller
{
    private function asegurarTablas()
    {
        if (!Schema::hasTable('tbl_inscripciones')) {
            Schema::create('tbl_inscripciones', function (Blueprint $table) {
                $table->id('id_participante');
                $table->bigInteger('id_torneo');
                $table->string('nombre_externo')->nullable();
                $table->timestamps();
            });
        }
        
        if (!Schema::hasTable('llaves_torneo')) {
            Schema::create('llaves_torneo', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('torneo_id');
                $table->string('fase')->nullable();
                $table->string('participante_1')->nullable();
                $table->string('participante_2')->nullable();
                $table->integer('goles_1')->nullable();
                $table->integer('goles_2')->nullable();
                $table->integer('penales_1')->nullable(); // NUEVO: Penales
                $table->integer('penales_2')->nullable(); // NUEVO: Penales
                $table->boolean('jugado')->default(false);
                $table->integer('jornada')->default(1);
                $table->integer('orden_bracket')->nullable();
                $table->bigInteger('siguiente_partido_id')->nullable();
                $table->timestamps();
            });
        } else {
            if (!Schema::hasColumn('llaves_torneo', 'penales_1')) {
                Schema::table('llaves_torneo', function (Blueprint $table) {
                    $table->integer('penales_1')->nullable();
                    $table->integer('penales_2')->nullable();
                });
            }
        }
    }

    public function index()
    {
        try {
            $this->asegurarTablas();
            $torneos = Torneo::with(['sede'])->get()->map(function ($torneo) {
                $torneo->inscritos_count = DB::table('tbl_inscripciones')->where('id_torneo', $torneo->id_torneo)->count();
                return $torneo;
            });
            return response()->json(['status' => 'success', 'data' => $torneos]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getInscripciones($id) {
        $this->asegurarTablas();
        return response()->json(['status' => 'success', 'data' => DB::table('tbl_inscripciones')->where('id_torneo', $id)->get()]);
    }

    public function inscribir(Request $request, $id)
    {
        $this->asegurarTablas();
        $count = DB::table('tbl_inscripciones')->where('id_torneo', $id)->count();
        if ($count >= 32) return response()->json(['status' => 'error', 'message' => 'Límite máximo de 32 equipos alcanzado.'], 400);

        $existe = DB::table('tbl_inscripciones')->where('id_torneo', $id)->where('nombre_externo', $request->nombre_equipo)->first();
        if ($existe) return response()->json(['status' => 'error', 'message' => 'El equipo ya está inscrito.'], 400);

        DB::table('tbl_inscripciones')->insert(['id_torneo' => $id, 'nombre_externo' => $request->nombre_equipo, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['status' => 'success']);
    }

    public function editarInscripcion(Request $request, $id) {
        DB::table('tbl_inscripciones')->where('id_participante', $id)->update(['nombre_externo' => $request->nombre_equipo, 'updated_at' => now()]);
        return response()->json(['status' => 'success']);
    }

    public function eliminarInscripcion($id) {
        DB::table('tbl_inscripciones')->where('id_participante', $id)->delete();
        return response()->json(['status' => 'success']);
    }

    public function generarSorteo($id)
    {
        try {
            $torneo = Torneo::findOrFail($id);
            $this->asegurarTablas();
            $inscripciones = DB::table('tbl_inscripciones')->where('id_torneo', $id)->get();
            if ($inscripciones->count() < 2) return response()->json(['status' => 'error', 'message' => 'Mínimo 2 equipos para sortear.'], 400);

            $participantes = $inscripciones->pluck('nombre_externo')->toArray();
            
            // SORTEO REAL: Revolvemos los equipos aleatoriamente
            shuffle($participantes);

            DB::table('llaves_torneo')->where('torneo_id', $id)->delete();
            $encuentros = [];

            if (str_contains(strtolower($torneo->tipo_bracket), 'liga') || str_contains(strtolower($torneo->tipo_bracket), 'round robin')) {
                // FASE DE GRUPOS
                while (count($participantes) % 4 != 0) $participantes[] = 'Libre';
                $grupos = array_chunk($participantes, 4);
                $letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

                foreach ($grupos as $index => $g) {
                    $nombreG = 'Grupo ' . ($letras[$index] ?? strval($index + 1));
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>1, 'participante_1'=>$g[0], 'participante_2'=>$g[1], 'created_at'=>now()];
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>1, 'participante_1'=>$g[2], 'participante_2'=>$g[3], 'created_at'=>now()];
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>2, 'participante_1'=>$g[0], 'participante_2'=>$g[2], 'created_at'=>now()];
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>2, 'participante_1'=>$g[1], 'participante_2'=>$g[3], 'created_at'=>now()];
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>3, 'participante_1'=>$g[0], 'participante_2'=>$g[3], 'created_at'=>now()];
                    $encuentros[] = ['torneo_id'=>$id, 'fase'=>$nombreG, 'jornada'=>3, 'participante_1'=>$g[1], 'participante_2'=>$g[2], 'created_at'=>now()];
                }
                DB::table('llaves_torneo')->insert($encuentros);
            } else {
                $this->crearArbolBracket($id, $participantes);
            }
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) { return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500); }
    }

    public function generarClasificacion(Request $request, $id)
    {
        try {
            $clasificados = $request->clasificados; 
            if(!$clasificados || count($clasificados) < 2) return response()->json(['status'=>'error', 'message'=>'Pocos clasificados'], 400);
            DB::table('llaves_torneo')->where('torneo_id', $id)->where('jornada', '>=', 4)->delete();
            $this->crearArbolBracket($id, $clasificados);
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) { return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500); }
    }

    private function crearArbolBracket($torneo_id, $equipos) {
        if (count($equipos) % 2 != 0) $equipos[] = 'Libre';
        $total = count($equipos);
        
        $faseActual = $total == 16 ? 'Octavos' : ($total == 8 ? 'Cuartos' : 'Semifinal');
        if ($total > 16) $faseActual = 'Ronda Preliminar';

        $ronda1 = [];
        $mitad = $total / 2;
        for ($i = 0; $i < $mitad; $i++) {
            $ronda1[] = [
                'torneo_id' => $torneo_id, 'fase' => $faseActual, 'jornada' => 4,
                'participante_1' => $equipos[$i], 'participante_2' => $equipos[$total - 1 - $i],
                'orden_bracket' => $i + 1, 'created_at' => now()
            ];
        }
        DB::table('llaves_torneo')->insert($ronda1);

        $fases = ['Octavos' => 'Cuartos', 'Cuartos' => 'Semifinal', 'Semifinal' => 'Final', 'Final' => 'Campeón'];
        $faseSiguiente = $fases[$faseActual] ?? 'Siguiente Ronda';
        $partidosRondaAnterior = DB::table('llaves_torneo')->where('torneo_id', $torneo_id)->where('fase', $faseActual)->orderBy('orden_bracket')->get();

        $jornada = 5;
        while(count($partidosRondaAnterior) > 1) {
            $nuevaRonda = [];
            $count = count($partidosRondaAnterior);
            for ($i = 0; $i < $count; $i += 2) {
                $id = DB::table('llaves_torneo')->insertGetId([
                    'torneo_id' => $torneo_id, 'fase' => $faseSiguiente, 'jornada' => $jornada,
                    'participante_1' => 'TBD', 'participante_2' => 'TBD',
                    'orden_bracket' => ($i/2) + 1, 'created_at' => now()
                ]);
                
                DB::table('llaves_torneo')->where('id', $partidosRondaAnterior[$i]->id)->update(['siguiente_partido_id' => $id]);
                if(isset($partidosRondaAnterior[$i+1])) {
                    DB::table('llaves_torneo')->where('id', $partidosRondaAnterior[$i+1]->id)->update(['siguiente_partido_id' => $id]);
                }
                $nuevaRonda[] = DB::table('llaves_torneo')->where('id', $id)->first();
            }
            $partidosRondaAnterior = $nuevaRonda;
            $faseSiguiente = $fases[$faseSiguiente] ?? 'Final';
            $jornada++;
        }
    }

    public function guardarMarcador(Request $request, $id_encuentro)
    {
        try {
            $partido = DB::table('llaves_torneo')->where('id', $id_encuentro)->first();
            
            $g1 = (int) $request->goles_1;
            $g2 = (int) $request->goles_2;
            $p1 = $request->has('penales_1') && $request->penales_1 !== null ? (int) $request->penales_1 : null;
            $p2 = $request->has('penales_2') && $request->penales_2 !== null ? (int) $request->penales_2 : null;

            DB::table('llaves_torneo')->where('id', $id_encuentro)->update([
                'goles_1' => $g1, 'goles_2' => $g2,
                'penales_1' => $p1, 'penales_2' => $p2,
                'jugado' => true, 'updated_at' => now()
            ]);

            // AUTO-AVANCE CON EMPATE Y PENALES RESUELTO
            if ($partido->siguiente_partido_id) {
                $ganador = null;
                if ($g1 > $g2) $ganador = $partido->participante_1;
                else if ($g2 > $g1) $ganador = $partido->participante_2;
                else if ($p1 !== null && $p2 !== null) {
                    $ganador = ($p1 > $p2) ? $partido->participante_1 : $partido->participante_2;
                }

                if ($ganador) {
                    $partidoSiguiente = DB::table('llaves_torneo')->where('id', $partido->siguiente_partido_id)->first();
                    if ($partidoSiguiente->participante_1 == 'TBD' || $partidoSiguiente->participante_1 == $partido->participante_1 || $partidoSiguiente->participante_1 == $partido->participante_2) {
                        DB::table('llaves_torneo')->where('id', $partido->siguiente_partido_id)->update(['participante_1' => $ganador]);
                    } else {
                        DB::table('llaves_torneo')->where('id', $partido->siguiente_partido_id)->update(['participante_2' => $ganador]);
                    }
                }
            }
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) { return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500); }
    }

    public function getLlaves($id) {
        $this->asegurarTablas();
        return response()->json(['status' => 'success', 'data' => DB::table('llaves_torneo')->where('torneo_id', $id)->orderBy('jornada')->orderBy('orden_bracket')->get()]);
    }
}