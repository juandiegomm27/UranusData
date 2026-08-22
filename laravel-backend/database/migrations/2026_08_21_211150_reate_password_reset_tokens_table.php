<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('documento', 20)->primary();
            $table->string('token', 255)->unique();
            $table->dateTime('expires_at');
            $table->timestamps();
            
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
            $table->index('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};