<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('preview')->nullable(); // Краткий текст для таблицы
            $table->longText('content'); // Полный текст статьи
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_materials');
    }
};