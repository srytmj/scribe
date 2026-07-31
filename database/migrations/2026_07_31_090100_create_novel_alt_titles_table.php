<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novel_alt_titles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('novel_id')->constrained('novels')->cascadeOnDelete();
            $table->string('language');
            $table->string('title');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novel_alt_titles');
    }
};
