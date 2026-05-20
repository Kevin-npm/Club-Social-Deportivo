<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_metodos_pago', function (Blueprint $table) {
            $table->bigIncrements('id_metodo');
            $table->string('nombre_metodo');
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cat_metodos_pago');
    }
};
