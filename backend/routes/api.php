<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PsychologistDashboardController;
use App\Http\Controllers\Api\PsychologistLoginLogController;
use App\Http\Controllers\Api\PsychologistMoodController;
use App\Http\Controllers\Api\PsychologistUserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/psychologist/dashboard', [PsychologistDashboardController::class, 'index']);

    Route::get('/psychologist/users', [PsychologistUserController::class, 'index']);
    Route::get('/psychologist/users/export', [PsychologistUserController::class, 'export']);
    Route::post('/psychologist/users', [PsychologistUserController::class, 'store']);

    Route::put('/psychologist/users/{id}', [PsychologistUserController::class, 'update']);
    Route::patch('/psychologist/users/{id}', [PsychologistUserController::class, 'update']);
    Route::delete('/psychologist/users/{id}', [PsychologistUserController::class, 'destroy']);

    Route::get('/psychologist/login-logs', [PsychologistLoginLogController::class, 'index']);

    Route::get('/psychologist/moods', [PsychologistMoodController::class, 'index']);
    Route::get('/psychologist/moods/export', [PsychologistMoodController::class, 'export']);
});