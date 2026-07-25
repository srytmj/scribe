<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novel_genre', function (Blueprint $table) {
            $table->foreignId('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained('genres')->cascadeOnDelete();
            $table->primary(['novel_id', 'genre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novel_genre');
    }
};
