<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_colorings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->string('coloring_key', 50);
            $table->timestamps();

            $table->unique(['child_id', 'coloring_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_colorings');
    }
};