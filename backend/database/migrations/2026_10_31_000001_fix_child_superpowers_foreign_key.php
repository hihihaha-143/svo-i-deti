<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('child_superpowers', function (Blueprint $table) {
            $table->dropForeign(['child_id']);
        });

        Schema::table('child_superpowers', function (Blueprint $table) {
            $table->foreign('child_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('child_superpowers', function (Blueprint $table) {
            $table->dropForeign(['child_id']);
        });

        Schema::table('child_superpowers', function (Blueprint $table) {
            $table->foreign('child_id')
                ->references('id')
                ->on('children')
                ->cascadeOnDelete();
        });
    }
};