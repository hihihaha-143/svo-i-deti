<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->integer('lesson_number');
            $table->date('lesson_date');

            $table->unique(['event_id', 'lesson_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_lessons');
    }
};