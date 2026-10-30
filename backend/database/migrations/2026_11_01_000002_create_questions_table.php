<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained('tests')->cascadeOnDelete();
            $table->text('question_text');
            $table->enum('type', ['single', 'scale', 'luscher']);
            $table->integer('order')->default(0);
            $table->json('options')->nullable();
            $table->string('scale_min_label')->nullable();
            $table->string('scale_max_label')->nullable();
            $table->boolean('allow_skip')->default(true);
            $table->json('age_restrictions')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};