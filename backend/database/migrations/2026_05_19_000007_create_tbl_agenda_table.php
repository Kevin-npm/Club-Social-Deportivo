<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_agenda', function (Blueprint $table) {
            $table->bigIncrements('id_sesion');
            $table->unsignedBigInteger('id_disciplina');
            $table->unsignedBigInteger('id_instructor')->nullable();
            $table->unsignedBigInteger('id_espacio');
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->integer('cupo_maximo')->default(20);
            $table->string('estado')->default('Programada');

            $table->foreign('id_disciplina')->references('id_disciplina')->on('cat_disciplinas')->onDelete('restrict');
            $table->foreign('id_instructor')->references('id_instructor')->on('tbl_instructores')->onDelete('set null');
            $table->foreign('id_espacio')->references('id_espacio')->on('tbl_instalaciones')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_agenda');
    }
};
