<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AgendaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_instructores')->insert([
            ['id_usuario' => 3, 'nombre_completo' => 'Carlos Ramírez', 'especialidad' => 'Fútbol', 'contacto' => '5551110001', 'estatus' => 'Activo'],
            ['id_usuario' => null, 'nombre_completo' => 'María González', 'especialidad' => 'Natación', 'contacto' => '5551110002', 'estatus' => 'Activo'],
            ['id_usuario' => null, 'nombre_completo' => 'Luis Torres', 'especialidad' => 'Tenis', 'contacto' => '5551110003', 'estatus' => 'Activo'],
            ['id_usuario' => null, 'nombre_completo' => 'Ana Rodríguez', 'especialidad' => 'Yoga', 'contacto' => '5551110004', 'estatus' => 'Activo'],
            ['id_usuario' => null, 'nombre_completo' => 'Pedro Sánchez', 'especialidad' => 'Basquetbol', 'contacto' => '5551110005', 'estatus' => 'Activo'],
        ]);

        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        DB::table('tbl_agenda')->insert([
            ['id_disciplina' => 1, 'id_instructor' => 1, 'id_espacio' => 1, 'fecha' => $today, 'hora_inicio' => '08:00:00', 'hora_fin' => '09:30:00', 'cupo_maximo' => 20, 'estado' => 'Programada'],
            ['id_disciplina' => 2, 'id_instructor' => 2, 'id_espacio' => 5, 'fecha' => $today, 'hora_inicio' => '10:00:00', 'hora_fin' => '11:00:00', 'cupo_maximo' => 15, 'estado' => 'Programada'],
            ['id_disciplina' => 3, 'id_instructor' => 3, 'id_espacio' => 2, 'fecha' => $today, 'hora_inicio' => '14:00:00', 'hora_fin' => '15:30:00', 'cupo_maximo' => 4, 'estado' => 'Programada'],
            ['id_disciplina' => 5, 'id_instructor' => 4, 'id_espacio' => 9, 'fecha' => $today, 'hora_inicio' => '16:00:00', 'hora_fin' => '17:00:00', 'cupo_maximo' => 20, 'estado' => 'Programada'],
            ['id_disciplina' => 4, 'id_instructor' => 5, 'id_espacio' => 4, 'fecha' => $tomorrow, 'hora_inicio' => '09:00:00', 'hora_fin' => '10:30:00', 'cupo_maximo' => 10, 'estado' => 'Programada'],
            ['id_disciplina' => 2, 'id_instructor' => 2, 'id_espacio' => 5, 'fecha' => $tomorrow, 'hora_inicio' => '11:00:00', 'hora_fin' => '12:00:00', 'cupo_maximo' => 15, 'estado' => 'Programada'],
            ['id_disciplina' => 6, 'id_instructor' => 4, 'id_espacio' => 9, 'fecha' => $tomorrow, 'hora_inicio' => '15:00:00', 'hora_fin' => '16:00:00', 'cupo_maximo' => 20, 'estado' => 'Programada'],
        ]);
    }
}
