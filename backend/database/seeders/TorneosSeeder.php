<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TorneosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('torneos')->insert([
            ['nombre_torneo' => 'Torneo de Fútbol Primavera 2026', 'tipo' => 'eliminacion_directa', 'cupo_maximo' => 16, 'fecha_inicio' => now()->addDays(7)->toDateString()],
            ['nombre_torneo' => 'Torneo de Tenis Doubles', 'tipo' => 'round_robin', 'cupo_maximo' => 8, 'fecha_inicio' => now()->addDays(14)->toDateString()],
        ]);

        DB::table('tbl_torneos')->insert([
            ['id_disciplina' => 1, 'nombre_torneo' => 'Copa Club Morelia - Fútbol', 'tipo' => 'eliminacion_directa', 'tipo_bracket' => 'single', 'categoria' => 'Adultos', 'sede_principal' => 1, 'fecha_inicio' => now()->addDays(7)->toDateString(), 'fecha_fin' => now()->addDays(30)->toDateString()],
            ['id_disciplina' => 3, 'nombre_torneo' => 'Torneo de Tenis Individual', 'tipo' => 'eliminacion_directa', 'tipo_bracket' => 'single', 'categoria' => 'Mixto', 'sede_principal' => 2, 'fecha_inicio' => now()->addDays(14)->toDateString(), 'fecha_fin' => now()->addDays(21)->toDateString()],
        ]);

        DB::table('jugadores_temporales')->insert([
            ['torneo_id' => 1, 'nombre' => 'Carlos', 'apellidos' => 'Mendoza', 'identificacion_unica' => 'JUG-001', 'telefono' => '5551234567'],
            ['torneo_id' => 1, 'nombre' => 'Roberto', 'apellidos' => 'Hernández', 'identificacion_unica' => 'JUG-002', 'telefono' => '5553456789'],
            ['torneo_id' => 1, 'nombre' => 'Jorge', 'apellidos' => 'Díaz', 'identificacion_unica' => 'JUG-003', 'telefono' => '5557890123'],
            ['torneo_id' => 2, 'nombre' => 'Fernando', 'apellidos' => 'López', 'identificacion_unica' => 'JUG-004', 'telefono' => '5555678901'],
            ['torneo_id' => 2, 'nombre' => 'Miguel', 'apellidos' => 'Castillo', 'identificacion_unica' => 'JUG-005', 'telefono' => '5559012345'],
        ]);

        DB::table('encuentros')->insert([
            ['torneo_id' => 1, 'fase' => 'Cuartos de Final', 'participante_1' => 'JUG-001', 'participante_2' => 'JUG-002', 'ganador' => null, 'fecha_inicio' => now()->addDays(7)->toDateTimeString(), 'fecha_fin' => null, 'cancha' => 'Cancha 1', 'juez_arbitro' => 'Carlos Ramírez'],
            ['torneo_id' => 1, 'fase' => 'Cuartos de Final', 'participante_1' => 'JUG-003', 'participante_2' => null, 'ganador' => null, 'fecha_inicio' => now()->addDays(7)->addHours(2)->toDateTimeString(), 'fecha_fin' => null, 'cancha' => 'Cancha 1', 'juez_arbitro' => 'Carlos Ramírez'],
        ]);
    }
}
