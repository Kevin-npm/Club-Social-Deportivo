<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_asistencias', function (Blueprint $table) {
            $table->bigIncrements('id_asistencia');
            $table->unsignedBigInteger('id_socio');
            $table->unsignedBigInteger('id_sesion');
            $table->string('token_qr')->nullable();
            $table->timestamp('timestamp_registro')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_socio')->references('id_socio')->on('tbl_socios')->onDelete('cascade');
            $table->foreign('id_sesion')->references('id_sesion')->on('tbl_agenda')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_asistencias');
    }
};
