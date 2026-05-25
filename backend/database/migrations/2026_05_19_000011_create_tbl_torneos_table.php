<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_torneos', function (Blueprint $table) {
            $table->bigIncrements('id_torneo');
            $table->unsignedBigInteger('id_disciplina')->nullable();
            $table->string('nombre_torneo');
            $table->string('tipo');
            $table->string('tipo_bracket')->nullable();
            $table->string('categoria')->nullable();
            $table->unsignedBigInteger('sede_principal')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();

            $table->foreign('id_disciplina')->references('id_disciplina')->on('cat_disciplinas')->onDelete('set null');
            $table->foreign('sede_principal')->references('id_espacio')->on('tbl_instalaciones')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_torneos');
    }
};
