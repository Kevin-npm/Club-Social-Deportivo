<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_reservas', function (Blueprint $table) {
            $table->bigIncrements('id_reserva');
            $table->unsignedBigInteger('id_socio');
            $table->unsignedBigInteger('id_espacio');
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('folio_reserva')->nullable();
            $table->string('estatus')->default('Pendiente');
            $table->boolean('estatus_noshow')->default(false);

            $table->foreign('id_socio')->references('id_socio')->on('tbl_socios')->onDelete('cascade');
            $table->foreign('id_espacio')->references('id_espacio')->on('tbl_instalaciones')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_reservas');
    }
};
