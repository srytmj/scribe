<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapter_reads', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->timestamp('read_at');

            $table->unique(['device_id', 'chapter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapter_reads');
    }
};
