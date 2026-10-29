<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychologist_id')->constrained('psychologists')->onDelete('cascade');
            $table->foreignId('mentor_id')->nullable()->constrained('mentors')->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['psychologist', 'mentor']);
            $table->integer('lessons_count');
            $table->date('start_date');
            $table->text('description')->nullable();
            $table->enum('schedule_type', ['weekly', 'every_n_days', 'daily', 'monthly']);
            $table->integer('schedule_interval')->nullable();
            $table->integer('schedule_day_of_week')->nullable();
            $table->timestamps();

            $table->index('psychologist_id');
            $table->index('mentor_id');
            $table->index('type');
            $table->index('start_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};