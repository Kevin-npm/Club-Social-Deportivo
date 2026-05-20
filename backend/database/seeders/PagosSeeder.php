<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PagosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_pagos')->insert([
            ['id_socio' => 1, 'id_metodo' => 1, 'monto' => 5000.00, 'concepto' => 'Mensualidad Marzo 2026', 'referencia' => 'PAGO-001', 'folio_digital' => 'FD-001', 'fecha_pago' => now()->subDays(5)->toDateTimeString()],
            ['id_socio' => 2, 'id_metodo' => 2, 'monto' => 5000.00, 'concepto' => 'Mensualidad Marzo 2026', 'referencia' => 'PAGO-002', 'folio_digital' => 'FD-002', 'fecha_pago' => now()->subDays(3)->toDateTimeString()],
            ['id_socio' => 3, 'id_metodo' => 4, 'monto' => 3500.00, 'concepto' => 'Renta Marzo 2026', 'referencia' => 'PAGO-003', 'folio_digital' => 'FD-003', 'fecha_pago' => now()->subDays(10)->toDateTimeString()],
            ['id_socio' => 4, 'id_metodo' => 1, 'monto' => 5000.00, 'concepto' => 'Mensualidad Marzo 2026', 'referencia' => 'PAGO-004', 'folio_digital' => 'FD-004', 'fecha_pago' => now()->subDays(1)->toDateTimeString()],
            ['id_socio' => 5, 'id_metodo' => 3, 'monto' => 3500.00, 'concepto' => 'Renta Marzo 2026', 'referencia' => 'PAGO-005', 'folio_digital' => 'FD-005', 'fecha_pago' => now()->subDays(7)->toDateTimeString()],
        ]);
    }
}
