<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('novel_author', function (Blueprint $table) {
            $table->foreignUuid('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignUuid('creator_id')->constrained('creators')->cascadeOnDelete();
            $table->primary(['novel_id', 'creator_id']);
        });

        Schema::create('novel_illustrator', function (Blueprint $table) {
            $table->foreignUuid('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignUuid('creator_id')->constrained('creators')->cascadeOnDelete();
            $table->primary(['novel_id', 'creator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novel_illustrator');
        Schema::dropIfExists('novel_author');
        Schema::dropIfExists('creators');
    }
};
