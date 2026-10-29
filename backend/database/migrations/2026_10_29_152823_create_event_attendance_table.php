<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_lesson_id')->constrained('event_lessons')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->boolean('attended')->default(false);

            $table->unique(['event_lesson_id', 'child_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_attendance');
    }
};