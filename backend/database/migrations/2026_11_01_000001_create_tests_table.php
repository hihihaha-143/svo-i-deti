<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychologist_id')->constrained('psychologists')->cascadeOnDelete();
            $table->string('title');
            $table->enum('for_whom', ['child', 'parent', 'both'])->default('child');
            $table->text('description')->nullable();
            $table->json('age_restrictions')->nullable();
            $table->text('motivation_text')->nullable();
            $table->string('coloring_file')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_monthly')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};