<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis');
            $table->string('cover_image')->nullable();
            $table->enum('status', ['draft', 'ongoing', 'completed', 'hiatus', 'dropped'])->default('draft');
            $table->string('origin_language');
            $table->string('translation_language');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novels');
    }
};
