<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_usuarios', function (Blueprint $table) {
            $table->bigIncrements('id_usuario');
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->unsignedInteger('id_rol')->default(3);
            $table->boolean('activo')->default(true);
            $table->timestamp('ultimo_login_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_usuarios');
    }
};
