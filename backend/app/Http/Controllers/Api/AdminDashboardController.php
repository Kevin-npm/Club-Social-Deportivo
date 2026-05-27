<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use App\Models\Reservas;
use App\Models\Pago;
use App\Models\Notificacion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function metrics()
    {
        $inicioMes = Carbon::now()->startOfMonth();
        $finMes = Carbon::now()->endOfMonth();

        $totalSocios = Socio::count();

        $sociosActivos = Socio::where('activo', true)->count();

        $sociosInactivos = Socio::where('activo', false)->count();

        $reservasActivas = Reservas::where('estatus', 'Activa')->count();

        $reservasCanceladas = Reservas::where('estatus', 'Cancelada')->count();

        $pagosMes = Pago::whereBetween('fecha_pago', [$inicioMes, $finMes])->count();

        $ingresosMes = Pago::whereBetween('fecha_pago', [$inicioMes, $finMes])
            ->sum('monto');

        $notificacionesNoLeidas = Notificacion::where('leido_boolean', false)->count();

        $reservasProximas = Reservas::with(['socio', 'espacio'])
            ->where('estatus', 'Activa')
            ->whereDate('fecha', '>=', Carbon::today())
            ->orderBy('fecha', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->limit(5)
            ->get();

        $ultimosPagos = Pago::with(['socio', 'metodo'])
            ->orderBy('fecha_pago', 'desc')
            ->limit(5)
            ->get();

        $sociosPorMembresia = Socio::select(
                'tipo_membresia',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tipo_membresia')
            ->orderBy('total', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_socios' => $totalSocios,
                'socios_activos' => $sociosActivos,
                'socios_inactivos' => $sociosInactivos,
                'reservas_activas' => $reservasActivas,
                'reservas_canceladas' => $reservasCanceladas,
                'pagos_mes' => $pagosMes,
                'ingresos_mes' => $ingresosMes,
                'notificaciones_no_leidas' => $notificacionesNoLeidas,
                'reservas_proximas' => $reservasProximas,
                'ultimos_pagos' => $ultimosPagos,
                'socios_por_membresia' => $sociosPorMembresia,
            ]
        ]);
    }
}