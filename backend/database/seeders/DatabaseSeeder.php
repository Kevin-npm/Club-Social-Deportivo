<?php

namespace Database\Seeders;

use App\Models\Socio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogoSeeder::class,
            SociosSeeder::class,
            InstalacionesSeeder::class,
            AgendaSeeder::class,
            TorneosSeeder::class,
            ReservasSeeder::class,
            PagosSeeder::class,
            CheckinsSeeder::class,
            NotificacionesSeeder::class,
        ]);
    }
}
