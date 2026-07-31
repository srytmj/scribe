<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genres', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('novel_genre', function (Blueprint $table) {
            $table->foreignUuid('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignUuid('genre_id')->constrained('genres')->cascadeOnDelete();
            $table->primary(['novel_id', 'genre_id']);
        });

        Schema::create('novel_tag', function (Blueprint $table) {
            $table->foreignUuid('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignUuid('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['novel_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novel_tag');
        Schema::dropIfExists('novel_genre');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('genres');
    }
};
