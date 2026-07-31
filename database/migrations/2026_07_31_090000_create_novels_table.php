<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('anilist_id')->nullable()->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis')->nullable();
            $table->string('cover_path')->nullable();
            $table->enum('status', ['draft', 'ongoing', 'completed', 'hiatus', 'dropped'])->default('draft');
            $table->string('origin_language')->nullable();
            $table->string('translation_language')->nullable();
            $table->decimal('anilist_score', 4, 2)->nullable();
            $table->boolean('is_mature')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novels');
    }
};
