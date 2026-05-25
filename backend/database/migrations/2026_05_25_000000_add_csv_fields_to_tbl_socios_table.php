<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_socios', function (Blueprint $table) {
            $table->string('numero_accion')->nullable();
            $table->string('tipo_accion')->nullable();
            $table->string('estatus_accion')->nullable();
            $table->string('rol')->nullable();
            $table->integer('edad')->nullable();
            $table->string('parentesco')->nullable();
            $table->text('domicilio')->nullable();
            $table->string('telefono_particular')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tbl_socios', function (Blueprint $table) {
            $table->dropColumn([
                'numero_accion',
                'tipo_accion',
                'estatus_accion',
                'rol',
                'edad',
                'parentesco',
                'domicilio',
                'telefono_particular'
            ]);
        });
    }
};
