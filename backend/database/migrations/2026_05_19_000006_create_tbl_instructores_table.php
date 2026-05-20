<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_instructores', function (Blueprint $table) {
            $table->bigIncrements('id_instructor');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('nombre_completo');
            $table->string('especialidad')->nullable();
            $table->string('contacto')->nullable();
            $table->string('estatus')->default('Activo');

            $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuarios')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_instructores');
    }
};
