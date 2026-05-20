<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_pagos', function (Blueprint $table) {
            $table->bigIncrements('id_pago');
            $table->unsignedBigInteger('id_socio');
            $table->unsignedBigInteger('id_metodo')->nullable();
            $table->decimal('monto', 10, 2);
            $table->string('concepto');
            $table->string('referencia')->nullable();
            $table->string('folio_digital')->nullable();
            $table->dateTime('fecha_pago')->useCurrent();

            $table->foreign('id_socio')->references('id_socio')->on('tbl_socios')->onDelete('cascade');
            $table->foreign('id_metodo')->references('id_metodo')->on('cat_metodos_pago')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_pagos');
    }
};
