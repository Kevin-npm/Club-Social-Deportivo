<?php

namespace Database\Seeders;

use App\Models\Socio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SociosSeeder extends Seeder
{
    public function run(): void
    {
        $socios = [
            ['Carlos', 'Mendoza Rivera', '1985-03-15', 'Masculino', 'Accionista', 'Familiar', 'carlos.mendoza@email.com', '5551234567'],
            ['María', 'García López', '1990-07-22', 'Femenino', 'Accionista', 'Familiar', 'maria.garcia@email.com', '5552345678'],
            ['Roberto', 'Hernández Torres', '1978-11-08', 'Masculino', 'Rentista', 'Individual', 'roberto.hernandez@email.com', '5553456789'],
            ['Ana', 'Martínez Ruiz', '1992-01-30', 'Femenino', 'Accionista', 'Familiar', 'ana.martinez@email.com', '5554567890'],
            ['Fernando', 'López Sánchez', '1988-06-12', 'Masculino', 'Rentista', 'Familiar', 'fernando.lopez@email.com', '5555678901'],
            ['Patricia', 'Ramírez Flores', '1995-09-25', 'Femenino', 'Accionista', 'Individual', 'patricia.ramirez@email.com', '5556789012'],
            ['Jorge', 'Díaz Morales', '1982-04-18', 'Masculino', 'Accionista', 'Familiar', 'jorge.diaz@email.com', '5557890123'],
            ['Laura', 'Torres Vargas', '1991-12-03', 'Femenino', 'Rentista', 'Individual', 'laura.torres@email.com', '5558901234'],
            ['Miguel', 'Castillo Ortiz', '1987-08-27', 'Masculino', 'Accionista', 'Familiar', 'miguel.castillo@email.com', '5559012345'],
            ['Gabriela', 'Jiménez Cruz', '1993-05-14', 'Femenino', 'Accionista', 'Familiar', 'gabriela.jimenez@email.com', '5550123456'],
            ['Ricardo', 'Vega Navarro', '1980-02-09', 'Masculino', 'Rentista', 'Familiar', 'ricardo.vega@email.com', '5551112222'],
            ['Sofía', 'Rojas Delgado', '1994-10-21', 'Femenino', 'Accionista', 'Individual', 'sofia.rojas@email.com', '5552223333'],
            ['Eduardo', 'Morales Peña', '1986-07-06', 'Masculino', 'Accionista', 'Familiar', 'eduardo.morales@email.com', '5553334444'],
            ['Valentina', 'Aguilar Reyes', '1996-03-19', 'Femenino', 'Rentista', 'Individual', 'valentina.aguilar@email.com', '5554445555'],
            ['Andrés', 'Guzmán Herrera', '1983-11-28', 'Masculino', 'Accionista', 'Familiar', 'andres.guzman@email.com', '5555556666'],
        ];

        $titularIds = [];

        foreach ($socios as $index => $socio) {
            $esRentista = $socio[4] === 'Rentista';
            $estatus = ['Vigente', 'Vigente', 'Vigente', 'Adeudo', 'Vigente', 'Vigente', 'Suspendido', 'Vigente', 'Vigente', 'Vigente', 'Vigente', 'Vigente', 'Adeudo', 'Vigente', 'Vigente'][$index];

            $idUsuario = DB::table('tbl_usuarios')->insertGetId([
                'email' => $socio[6],
                'password_hash' => Hash::make('socio123'),
                'id_rol' => 4,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_usuario');

            $idSocio = DB::table('tbl_socios')->insertGetId([
                'id_usuario' => $idUsuario,
                'nombre' => $socio[0],
                'apellidos' => $socio[1],
                'correo' => $socio[6],
                'telefono' => $socio[7],
                'fecha_nacimiento' => $socio[2],
                'genero' => $socio[3],
                'tipo_membresia' => $socio[4],
                'modalidad' => $socio[5],
                'numero_documento' => 'ACC-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'fecha_inicio_vigencia' => $esRentista ? now()->toDateString() : null,
                'fecha_fin_vigencia' => $esRentista ? now()->addMonths(6)->toDateString() : null,
                'estatus_financiero' => $estatus,
                'es_titular' => true,
                'id_titular_fk' => null,
                'activo' => $estatus !== 'Suspendido',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_socio');

            $titularIds[] = $idSocio;
        }

        $dependientes = [
            ['Elena', 'Mendoza Rivera', '1987-05-20', 'Femenino', 'Esposo(a)', 0],
            ['Diego', 'Mendoza Mendoza', '2010-08-15', 'Masculino', 'Hijo(a)', 0],
            ['Lucía', 'Mendoza Mendoza', '2013-02-28', 'Femenino', 'Hijo(a)', 0],
            ['Pedro', 'García López', '1988-09-10', 'Masculino', 'Esposo(a)', 1],
            ['Camila', 'García García', '2012-04-05', 'Femenino', 'Hijo(a)', 1],
            ['Mateo', 'García García', '2015-11-18', 'Masculino', 'Hijo(a)', 1],
            ['Claudia', 'López Sánchez', '1990-03-22', 'Femenino', 'Esposo(a)', 4],
            ['Daniela', 'López López', '2014-07-30', 'Femenino', 'Hijo(a)', 4],
            ['Alejandro', 'Díaz Morales', '1984-06-25', 'Masculino', 'Esposo(a)', 6],
            ['Isabella', 'Díaz Díaz', '2011-09-12', 'Femenino', 'Hijo(a)', 6],
            ['Sebastián', 'Díaz Díaz', '2016-01-08', 'Masculino', 'Hijo(a)', 6],
            ['Mariana', 'Castillo Ortiz', '1989-12-15', 'Femenino', 'Esposo(a)', 8],
            ['Nicolás', 'Castillo Castillo', '2013-06-20', 'Masculino', 'Hijo(a)', 8],
            ['Renata', 'Jiménez Cruz', '1985-04-10', 'Femenino', 'Esposo(a)', 9],
            ['Emiliano', 'Jiménez Jiménez', '2012-08-25', 'Masculino', 'Hijo(a)', 9],
            ['Andrea', 'Jiménez Jiménez', '2017-03-14', 'Femenino', 'Hijo(a)', 9],
            ['Carmen', 'Vega Navarro', '1982-01-05', 'Femenino', 'Esposo(a)', 10],
            ['Joaquín', 'Vega Vega', '2014-10-30', 'Masculino', 'Hijo(a)', 10],
            ['Ximena', 'Morales Peña', '1988-08-18', 'Femenino', 'Esposo(a)', 12],
            ['Samuel', 'Morales Morales', '2015-05-22', 'Masculino', 'Hijo(a)', 12],
            ['Fernanda', 'Guzmán Herrera', '1985-09-03', 'Femenino', 'Esposo(a)', 14],
            ['Matías', 'Guzmán Guzmán', '2013-12-11', 'Masculino', 'Hijo(a)', 14],
            ['Valeria', 'Guzmán Guzmán', '2018-02-28', 'Femenino', 'Hijo(a)', 14],
        ];

        foreach ($dependientes as $dep) {
            $titularIdx = $dep[5];
            $titularId = $titularIds[$titularIdx];

            DB::table('tbl_socios')->insert([
                'id_usuario' => null,
                'nombre' => $dep[0],
                'apellidos' => $dep[1],
                'correo' => null,
                'telefono' => null,
                'fecha_nacimiento' => $dep[2],
                'genero' => $dep[3],
                'tipo_membresia' => 'Accionista',
                'modalidad' => 'Familiar',
                'numero_documento' => null,
                'fecha_inicio_vigencia' => null,
                'fecha_fin_vigencia' => null,
                'estatus_financiero' => 'Vigente',
                'es_titular' => false,
                'id_titular_fk' => $titularId,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
