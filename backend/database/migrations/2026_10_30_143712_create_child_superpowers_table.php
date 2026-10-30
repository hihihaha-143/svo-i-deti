<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_superpowers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('independence')->default(0);
            $table->unsignedTinyInteger('emotional_sphere')->default(0);
            $table->unsignedTinyInteger('responsibility')->default(0);
            $table->unsignedTinyInteger('creativity')->default(0);
            $table->unsignedTinyInteger('organization')->default(0);
            $table->unsignedTinyInteger('sociability')->default(0);
            $table->unsignedTinyInteger('social_activity')->default(0);
            $table->unsignedTinyInteger('willpower')->default(0);
            $table->timestamps();

            $table->unique('child_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_superpowers');
    }
};