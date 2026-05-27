<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getResumen(Request $request)
    {
        try {
            $hoy = Carbon::today();

            // ── 1. KPIs de Socios (tbl_socios) ──────────────────────────────
            $totalSociosActivos = DB::table('tbl_socios')->where('activo', true)->count();
            $sociosTitulares    = DB::table('tbl_socios')->where('activo', true)->where('es_titular', true)->count();
            $sociosMiembros     = DB::table('tbl_socios')->where('activo', true)->where('es_titular', false)->count();

            // ── 2. Instructores (tbl_instructores) ───────────────────────────
            $totalInstructores = DB::table('tbl_instructores')->where('estatus', 'Activo')->count();

            // ── 3. Instalaciones ocupadas hoy (tbl_reservas → id_espacio) ───
            $instalacionesOcupadas = DB::table('tbl_reservas')
                ->whereDate('fecha', $hoy)
                ->where('estatus', '!=', 'Cancelada')
                ->distinct('id_espacio')
                ->count('id_espacio');

            $totalInstalaciones = DB::table('tbl_instalaciones')
                ->where('estatus', 'Activa')
                ->count();

            // ── 4. Sesiones del día (tbl_agenda → campo: fecha) ──────────────
            $sesionesHoy = DB::table('tbl_agenda')
                ->whereDate('fecha', $hoy)
                ->where('estado', '!=', 'Cancelada')
                ->count();

            // ── 5. Distribución de acciones por tipo_membresia ───────────────
            //    Valores reales: 'Accionista', 'Rentista'
            $accionesPorTipo = DB::table('tbl_socios')
                ->where('activo', true)
                ->select('tipo_membresia as name', DB::raw('count(*) as value'))
                ->groupBy('tipo_membresia')
                ->orderByDesc('value')
                ->get();

            // ── 6. Nuevos socios por mes (últimos 6 meses) ───────────────────
            $nuevosSociosPorMes = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes   = Carbon::today()->subMonths($i);
                $count = DB::table('tbl_socios')
                    ->whereYear('created_at', $mes->year)
                    ->whereMonth('created_at', $mes->month)
                    ->count();
                $nuevosSociosPorMes[] = [
                    'mes'    => $mes->locale('es')->isoFormat('MMM YY'),
                    'socios' => $count,
                ];
            }

            // ── 7. Próximas sesiones del día con instructor y espacio ────────
            //    tbl_agenda: id_sesion, id_disciplina, id_instructor, id_espacio,
            //                fecha, hora_inicio, hora_fin, cupo_maximo, estado
            //    tbl_instructores: id_instructor, nombre_completo, especialidad
            //    tbl_instalaciones: id_espacio, nombre_especifico
            //    cat_disciplinas: id_disciplina, nombre_disciplina
            $proximasSesiones = DB::table('tbl_agenda as a')
                ->leftJoin('tbl_instructores as i', 'a.id_instructor', '=', 'i.id_instructor')
                ->leftJoin('tbl_instalaciones as ins', 'a.id_espacio', '=', 'ins.id_espacio')
                ->leftJoin('cat_disciplinas as d', 'a.id_disciplina', '=', 'd.id_disciplina')
                ->whereDate('a.fecha', $hoy)
                ->where('a.estado', '!=', 'Cancelada')
                ->orderBy('a.hora_inicio', 'asc')
                ->limit(10)
                ->select(
                    'a.id_sesion as id',
                    'd.nombre_disciplina as sesion_nombre',
                    DB::raw("CONCAT(a.fecha, 'T', a.hora_inicio) as fecha_inicio"),
                    'a.cupo_maximo as capacidad_maxima',
                    'a.estado',
                    DB::raw("COALESCE(i.nombre_completo, 'Sin asignar') as instructor_nombre"),
                    'ins.nombre_especifico as instalacion_nombre'
                )
                ->get();

            // ── 8. Estatus financiero breakdown ──────────────────────────────
            $estatusFinanciero = DB::table('tbl_socios')
                ->where('activo', true)
                ->select('estatus_financiero', DB::raw('count(*) as total'))
                ->groupBy('estatus_financiero')
                ->orderByDesc('total')
                ->get();

            // ── 9. Crecimiento de socios mes actual vs mes anterior ──────────
            $mesActual   = DB::table('tbl_socios')
                ->whereYear('created_at', $hoy->year)
                ->whereMonth('created_at', $hoy->month)
                ->count();
            $mesAnterior = DB::table('tbl_socios')
                ->whereYear('created_at', $hoy->copy()->subMonth()->year)
                ->whereMonth('created_at', $hoy->copy()->subMonth()->month)
                ->count();
            $crecimiento = $mesAnterior > 0
                ? round((($mesActual - $mesAnterior) / $mesAnterior) * 100, 1)
                : ($mesActual > 0 ? 100 : 0);

            // ── 10. Ocupación de agenda por instalación hoy ──────────────────
            $ocupacionInstalaciones = DB::table('tbl_agenda as a')
                ->join('tbl_instalaciones as ins', 'a.id_espacio', '=', 'ins.id_espacio')
                ->whereDate('a.fecha', $hoy)
                ->where('a.estado', '!=', 'Cancelada')
                ->select('ins.nombre_especifico as nombre', DB::raw('count(*) as sesiones'))
                ->groupBy('ins.id_espacio', 'ins.nombre_especifico')
                ->orderByDesc('sesiones')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'kpis' => [
                        'totalSociosActivos'    => $totalSociosActivos,
                        'sociosTitulares'       => $sociosTitulares,
                        'sociosMiembros'        => $sociosMiembros,
                        'totalInstructores'     => $totalInstructores,
                        'instalacionesOcupadas' => $instalacionesOcupadas,
                        'totalInstalaciones'    => $totalInstalaciones,
                        'sesionesHoy'           => $sesionesHoy,
                        'crecimientoMes'        => $crecimiento,
                    ],
                    'accionesPorTipo'         => $accionesPorTipo,
                    'nuevosSociosPorMes'      => $nuevosSociosPorMes,
                    'proximasSesiones'        => $proximasSesiones,
                    'estatusFinanciero'       => $estatusFinanciero,
                    'ocupacionInstalaciones'  => $ocupacionInstalaciones,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al obtener el resumen: ' . $e->getMessage(),
                'trace'   => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }
}
