<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_retakes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('test_id')->constrained('tests')->cascadeOnDelete();
            $table->timestamp('allowed_at');
            $table->timestamps();

            $table->unique(['child_id', 'test_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_retakes');
    }
};