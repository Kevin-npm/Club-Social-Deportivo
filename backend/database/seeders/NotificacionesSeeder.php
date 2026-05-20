<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificacionesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_notificaciones')->insert([
            ['id_socio' => 1, 'titulo' => 'Bienvenido al club', 'mensaje' => 'Tu membresía ha sido activada exitosamente. ¡Bienvenido al Club Morelia!', 'leido_boolean' => true],
            ['id_socio' => 2, 'titulo' => 'Recordatorio de pago', 'mensaje' => 'Tu próximo pago vence en 5 días. Recuerda mantener tu membresía al corriente.', 'leido_boolean' => false],
            ['id_socio' => 4, 'titulo' => 'Nuevo torneo disponible', 'mensaje' => 'Se ha abierto la inscripción al Torneo de Tenis Individual. ¡Inscríbete!', 'leido_boolean' => false],
            ['id_socio' => 7, 'titulo' => 'Cambio de horario', 'mensaje' => 'El horario de la alberca ha cambiado. Consulta los nuevos horarios en la sección de actividades.', 'leido_boolean' => true],
        ]);
    }
}
