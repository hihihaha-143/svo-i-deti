<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('chat_template_categories')->onDelete('cascade');
            $table->string('name');
            $table->text('text');
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_templates');
    }
};