<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnDelete();
            $table->timestamp('received_at')->useCurrent();
            $table->timestamps();

            $table->unique(['child_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_achievements');
    }
};