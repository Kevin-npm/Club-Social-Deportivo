<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_instalaciones', function (Blueprint $table) {
            $table->bigIncrements('id_espacio');
            $table->unsignedBigInteger('id_categoria')->nullable();
            $table->string('nombre_especifico');
            $table->string('ubicacion')->nullable();
            $table->string('tipo_superficie')->nullable();
            $table->integer('capacidad_max')->nullable();
            $table->time('horario_apertura')->nullable();
            $table->time('horario_cierre')->nullable();
            $table->text('equipamiento')->nullable();
            $table->string('estatus')->default('Activa');
            $table->boolean('permite_reserva')->default(true);

            $table->foreign('id_categoria')->references('id_categoria')->on('cat_areas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_instalaciones');
    }
};
