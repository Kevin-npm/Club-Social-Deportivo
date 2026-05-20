<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_invitados', function (Blueprint $table) {
            $table->bigIncrements('id_invitado');
            $table->unsignedBigInteger('id_socio');
            $table->string('nombre', 100);
            $table->string('apellidos', 120);
            $table->date('fecha_registro')->default(now());
            $table->string('estatus', 20)->default('Pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('id_socio')->references('id_socio')->on('tbl_socios')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE tbl_invitados ADD CONSTRAINT tbl_invitados_estatus_check CHECK (estatus IN ('Pendiente', 'Autorizado', 'Usado', 'Expirado'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_invitados');
    }
};
