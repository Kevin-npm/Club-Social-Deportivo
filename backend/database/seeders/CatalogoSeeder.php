<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_usuarios')->insert([
            [
                'email' => 'admin@clubmorelia.com',
                'password_hash' => Hash::make('admin123'),
                'id_rol' => 1,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'email' => 'recepcion@clubmorelia.com',
                'password_hash' => Hash::make('recepcion123'),
                'id_rol' => 2,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'email' => 'instructor@clubmorelia.com',
                'password_hash' => Hash::make('instructor123'),
                'id_rol' => 3,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('cat_areas')->insert([
            ['nombre_area' => 'Canchas', 'descripcion' => 'Canchas deportivas', 'activa' => true],
            ['nombre_area' => 'Alberca', 'descripcion' => 'Área de alberca', 'activa' => true],
            ['nombre_area' => 'Salones', 'descripcion' => 'Salones de usos múltiples', 'activa' => true],
            ['nombre_area' => 'Gimnasio', 'descripcion' => 'Área de gimnasio y fitness', 'activa' => true],
            ['nombre_area' => 'Ludoteca', 'descripcion' => 'Área infantil', 'activa' => true],
        ]);

        DB::table('cat_disciplinas')->insert([
            ['nombre_disciplina' => 'Fútbol', 'descripcion' => 'Fútbol soccer', 'categoria' => 'Deporte colectivo', 'equipo_necesario' => 'Balones, conos, petos', 'activa' => true],
            ['nombre_disciplina' => 'Natación', 'descripcion' => 'Clases de natación', 'categoria' => 'Deporte individual', 'equipo_necesario' => 'Traje de baño, gorro', 'activa' => true],
            ['nombre_disciplina' => 'Tenis', 'descripcion' => 'Tenis individual y dobles', 'categoria' => 'Deporte individual', 'equipo_necesario' => 'Raqueta, pelotas', 'activa' => true],
            ['nombre_disciplina' => 'Basquetbol', 'descripcion' => 'Basquetbol', 'categoria' => 'Deporte colectivo', 'equipo_necesario' => 'Balones', 'activa' => true],
            ['nombre_disciplina' => 'Yoga', 'descripcion' => 'Clases de yoga', 'categoria' => 'Bienestar', 'equipo_necesario' => 'Mat de yoga', 'activa' => true],
            ['nombre_disciplina' => 'Pilates', 'descripcion' => 'Clases de pilates', 'categoria' => 'Bienestar', 'equipo_necesario' => 'Mat, bandas', 'activa' => true],
        ]);

        DB::table('cat_metodos_pago')->insert([
            ['nombre_metodo' => 'Efectivo', 'activo' => true],
            ['nombre_metodo' => 'Tarjeta de crédito', 'activo' => true],
            ['nombre_metodo' => 'Tarjeta de débito', 'activo' => true],
            ['nombre_metodo' => 'Transferencia', 'activo' => true],
        ]);
    }
}
