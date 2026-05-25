<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_disciplinas', function (Blueprint $table) {
            $table->bigIncrements('id_disciplina');
            $table->string('nombre_disciplina');
            $table->text('descripcion')->nullable();
            $table->string('categoria')->nullable();
            $table->string('equipo_necesario')->nullable();
            $table->boolean('activa')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cat_disciplinas');
    }
};
