<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReservasSeeder extends Seeder
{
    public function run(): void
    {
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        DB::table('tbl_reservas')->insert([
            ['id_socio' => 1, 'id_espacio' => 2, 'fecha' => $today, 'hora_inicio' => '10:00:00', 'hora_fin' => '11:00:00', 'folio_reserva' => 'RES-001', 'estatus' => 'Confirmada', 'estatus_noshow' => false],
            ['id_socio' => 2, 'id_espacio' => 7, 'fecha' => $today, 'hora_inicio' => '18:00:00', 'hora_fin' => '22:00:00', 'folio_reserva' => 'RES-002', 'estatus' => 'Confirmada', 'estatus_noshow' => false],
            ['id_socio' => 4, 'id_espacio' => 3, 'fecha' => $tomorrow, 'hora_inicio' => '08:00:00', 'hora_fin' => '09:30:00', 'folio_reserva' => 'RES-003', 'estatus' => 'Pendiente', 'estatus_noshow' => false],
            ['id_socio' => 7, 'id_espacio' => 9, 'fecha' => $tomorrow, 'hora_inicio' => '06:00:00', 'hora_fin' => '08:00:00', 'folio_reserva' => 'RES-004', 'estatus' => 'Confirmada', 'estatus_noshow' => false],
        ]);
    }
}
