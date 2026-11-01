<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['child_psychologist', 'child_mentor', 'parent_psychologist']);
            $table->foreignId('child_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant_two_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->string('last_message_preview', 255)->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->unique(['type', 'participant_one_id', 'participant_two_id'], 'conversations_pair_unique');
            $table->index('child_id');
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};