<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstalacionesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_instalaciones')->insert([
            ['id_categoria' => 1, 'nombre_especifico' => 'Cancha 1 - Fútbol', 'ubicacion' => 'Zona Norte', 'tipo_superficie' => 'Pasto sintético', 'capacidad_max' => 22, 'horario_apertura' => '07:00:00', 'horario_cierre' => '22:00:00', 'equipamiento' => 'Porterías, iluminación', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 1, 'nombre_especifico' => 'Cancha 2 - Tenis', 'ubicacion' => 'Zona Este', 'tipo_superficie' => 'Dura', 'capacidad_max' => 4, 'horario_apertura' => '07:00:00', 'horario_cierre' => '21:00:00', 'equipamiento' => 'Red, iluminación', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 1, 'nombre_especifico' => 'Cancha 3 - Tenis', 'ubicacion' => 'Zona Este', 'tipo_superficie' => 'Arcilla', 'capacidad_max' => 4, 'horario_apertura' => '07:00:00', 'horario_cierre' => '21:00:00', 'equipamiento' => 'Red, iluminación', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 1, 'nombre_especifico' => 'Cancha 4 - Basquetbol', 'ubicacion' => 'Zona Sur', 'tipo_superficie' => 'Concreto', 'capacidad_max' => 10, 'horario_apertura' => '07:00:00', 'horario_cierre' => '22:00:00', 'equipamiento' => 'Tableros, iluminación', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 2, 'nombre_especifico' => 'Alberca Olímpica', 'ubicacion' => 'Zona Central', 'tipo_superficie' => 'Agua', 'capacidad_max' => 30, 'horario_apertura' => '06:00:00', 'horario_cierre' => '20:00:00', 'equipamiento' => 'Carriles, trampolín', 'estatus' => 'Activa', 'permite_reserva' => false],
            ['id_categoria' => 2, 'nombre_especifico' => 'Alberca Infantil', 'ubicacion' => 'Zona Central', 'tipo_superficie' => 'Agua', 'capacidad_max' => 15, 'horario_apertura' => '08:00:00', 'horario_cierre' => '18:00:00', 'equipamiento' => 'Juegos acuáticos', 'estatus' => 'Activa', 'permite_reserva' => false],
            ['id_categoria' => 3, 'nombre_especifico' => 'Salón de Eventos A', 'ubicacion' => 'Edificio Principal', 'tipo_superficie' => 'Madera', 'capacidad_max' => 80, 'horario_apertura' => '08:00:00', 'horario_cierre' => '23:00:00', 'equipamiento' => 'Audio, video, aire acondicionado', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 3, 'nombre_especifico' => 'Salón de Eventos B', 'ubicacion' => 'Edificio Principal', 'tipo_superficie' => 'Madera', 'capacidad_max' => 40, 'horario_apertura' => '08:00:00', 'horario_cierre' => '23:00:00', 'equipamiento' => 'Proyector, aire acondicionado', 'estatus' => 'Activa', 'permite_reserva' => true],
            ['id_categoria' => 4, 'nombre_especifico' => 'Gimnasio Principal', 'ubicacion' => 'Edificio Principal', 'tipo_superficie' => 'Hule', 'capacidad_max' => 25, 'horario_apertura' => '06:00:00', 'horario_cierre' => '22:00:00', 'equipamiento' => 'Máquinas, pesas, tapetes', 'estatus' => 'Activa', 'permite_reserva' => false],
            ['id_categoria' => 5, 'nombre_especifico' => 'Ludoteca', 'ubicacion' => 'Edificio Infantil', 'tipo_superficie' => 'Vinil', 'capacidad_max' => 20, 'horario_apertura' => '09:00:00', 'horario_cierre' => '19:00:00', 'equipamiento' => 'Juegos, juguetes, mesas', 'estatus' => 'Activa', 'permite_reserva' => false],
        ]);
    }
}
