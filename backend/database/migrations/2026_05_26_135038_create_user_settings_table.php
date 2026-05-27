<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_usuario')->unique();

            $table->boolean('email_notifications')->default(true);
            $table->boolean('system_alerts')->default(true);
            $table->boolean('security_alerts')->default(true);
            $table->boolean('compact_mode')->default(false);

            $table->string('theme', 20)->default('dark');
            $table->string('accent', 20)->default('yellow');

            $table->timestamps();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('tbl_usuarios')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};