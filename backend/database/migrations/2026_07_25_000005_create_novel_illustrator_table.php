<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novel_illustrator', function (Blueprint $table) {
            $table->foreignId('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('creators')->cascadeOnDelete();
            $table->primary(['novel_id', 'creator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novel_illustrator');
    }
};
