<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Reemplaza el trigger para que permita reservas para HOY o MAÑANA
        // usando la zona horaria America/Mexico_City (UTC-6)
        // y con un margen de ±2 días en UTC para cubrir cualquier desfase.
        DB::unprepared("
            CREATE OR REPLACE FUNCTION fn_validar_reserva_mismo_dia()
            RETURNS trigger AS \$\$
            DECLARE
                fecha_local DATE;
            BEGIN
                -- Fecha actual en zona horaria Mexico City (UTC-6)
                fecha_local := (NOW() AT TIME ZONE 'America/Mexico_City')::date;

                -- Permitir: desde ayer hasta pasado mañana (cubre desfases de zona horaria)
                IF NEW.fecha < fecha_local - INTERVAL '1 day'
                   OR NEW.fecha > fecha_local + INTERVAL '2 days'
                THEN
                    RAISE EXCEPTION 'Solo se permiten reservaciones para hoy o mañana.';
                END IF;

                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");
    }

    public function down(): void
    {
        // Restaura el trigger original (solo mismo día)
        DB::unprepared("
            CREATE OR REPLACE FUNCTION fn_validar_reserva_mismo_dia()
            RETURNS trigger AS \$\$
            BEGIN
                IF NEW.fecha <> CURRENT_DATE THEN
                    RAISE EXCEPTION 'Solo se permiten reservaciones para el mismo dia.';
                END IF;
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");
    }
};
