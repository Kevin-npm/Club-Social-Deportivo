<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CheckinsSeeder extends Seeder
{
    public function run(): void
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        DB::table('tbl_checkins')->insert([
            ['id_socio' => 1, 'fecha' => $today, 'hora_entrada' => '08:30:00', 'acceso_permitido' => true, 'motivo_denegado' => null],
            ['id_socio' => 2, 'fecha' => $today, 'hora_entrada' => '09:15:00', 'acceso_permitido' => true, 'motivo_denegado' => null],
            ['id_socio' => 4, 'fecha' => $today, 'hora_entrada' => '10:00:00', 'acceso_permitido' => true, 'motivo_denegado' => null],
            ['id_socio' => 7, 'fecha' => $yesterday, 'hora_entrada' => '07:45:00', 'acceso_permitido' => true, 'motivo_denegado' => null],
            ['id_socio' => 3, 'fecha' => $yesterday, 'hora_entrada' => '11:30:00', 'acceso_permitido' => false, 'motivo_denegado' => 'Adeudo pendiente'],
        ]);
    }
}
