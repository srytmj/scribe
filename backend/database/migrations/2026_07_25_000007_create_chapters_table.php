<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignId('volume_id')->nullable()->constrained('volumes')->nullOnDelete();
            $table->decimal('chapter_number', 8, 1);
            $table->string('title')->nullable();
            $table->text('content');
            $table->enum('status', ['draft', 'on_revision', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('last_autosaved_at')->nullable();
            $table->timestamps();

            $table->unique(['novel_id', 'volume_id', 'chapter_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
