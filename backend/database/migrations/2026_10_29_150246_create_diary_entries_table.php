<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('parents')->onDelete('cascade');
            $table->enum('event', ['before_school', 'after_school', 'homework', 'walk', 'other']);
            $table->text('text');
            $table->timestamps();

            $table->index('child_id');
            $table->index('parent_id');
            $table->index('event');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_entries');
    }
};