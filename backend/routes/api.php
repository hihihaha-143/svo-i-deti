<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatTemplateCategoryController;
use App\Http\Controllers\Api\ChatTemplateController;
use App\Http\Controllers\Api\MentorDashboardController;
use App\Http\Controllers\Api\PsychologistDashboardController;
use App\Http\Controllers\Api\PsychologistDailyTipController;
use App\Http\Controllers\Api\PsychologistDiaryController;
use App\Http\Controllers\Api\PsychologistEventController;
use App\Http\Controllers\Api\PsychologistLoginLogController;
use App\Http\Controllers\Api\PsychologistMoodController;
use App\Http\Controllers\Api\PsychologistParentMaterialController;
use App\Http\Controllers\Api\PsychologistRecommendationController;
use App\Http\Controllers\Api\PsychologistTestResultController;
use App\Http\Controllers\Api\PsychologistUserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MentorChildController;
use App\Http\Controllers\Api\MentorMoodController;
use App\Http\Controllers\Api\MentorEventController;
use App\Http\Controllers\Api\PsychologistTestController;



Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Психолог
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

    Route::get('/psychologist/diaries', [PsychologistDiaryController::class, 'index']);
    Route::get('/psychologist/diaries/export', [PsychologistDiaryController::class, 'export']);

    Route::get('/psychologist/events', [PsychologistEventController::class, 'index']);
    Route::post('/psychologist/events', [PsychologistEventController::class, 'store']);
    Route::put('/psychologist/events/{id}', [PsychologistEventController::class, 'update']);
    Route::delete('/psychologist/events/{id}', [PsychologistEventController::class, 'destroy']);

    Route::get('/psychologist/events/{id}/attendance', [PsychologistEventController::class, 'attendance']);
    Route::post('/psychologist/events/{id}/attendance', [PsychologistEventController::class, 'saveAttendance']);

    // Чат-шаблоны
    Route::get('/psychologist/chat-template-categories', [ChatTemplateCategoryController::class, 'index']);
    Route::post('/psychologist/chat-template-categories', [ChatTemplateCategoryController::class, 'store']);
    Route::put('/psychologist/chat-template-categories/{category}', [ChatTemplateCategoryController::class, 'update']);
    Route::delete('/psychologist/chat-template-categories/{category}', [ChatTemplateCategoryController::class, 'destroy']);

    Route::get('/psychologist/chat-templates', [ChatTemplateController::class, 'index']);
    Route::post('/psychologist/chat-templates', [ChatTemplateController::class, 'store']);
    Route::put('/psychologist/chat-templates/{chatTemplate}', [ChatTemplateController::class, 'update']);
    Route::delete('/psychologist/chat-templates/{chatTemplate}', [ChatTemplateController::class, 'destroy']);

    // Материалы для родителей
    Route::get('/psychologist/parent-materials', [PsychologistParentMaterialController::class, 'index']);
    Route::post('/psychologist/parent-materials', [PsychologistParentMaterialController::class, 'store']);
    Route::put('/psychologist/parent-materials/{material}', [PsychologistParentMaterialController::class, 'update']);
    Route::delete('/psychologist/parent-materials/{material}', [PsychologistParentMaterialController::class, 'destroy']);
    Route::post('/psychologist/parent-materials/{material}/toggle-publish', [PsychologistParentMaterialController::class, 'togglePublish']);

    // Ежедневные советы
    Route::get('/psychologist/daily-tips', [PsychologistDailyTipController::class, 'index']);
    Route::post('/psychologist/daily-tips', [PsychologistDailyTipController::class, 'store']);
    Route::put('/psychologist/daily-tips/{tip}', [PsychologistDailyTipController::class, 'update']);
    Route::delete('/psychologist/daily-tips/{tip}', [PsychologistDailyTipController::class, 'destroy']);

    // Рекомендации родителям
    Route::get('/psychologist/recommendations', [PsychologistRecommendationController::class, 'index']);
    Route::post('/psychologist/recommendations', [PsychologistRecommendationController::class, 'store']);
    Route::put('/psychologist/recommendations/{recommendation}', [PsychologistRecommendationController::class, 'update']);
    Route::delete('/psychologist/recommendations/{recommendation}', [PsychologistRecommendationController::class, 'destroy']);
    Route::post('/psychologist/recommendations/{recommendation}/mark-unread', [PsychologistRecommendationController::class, 'markAsUnread']);


    // Тесты
    Route::get('/psychologist/tests', [PsychologistTestController::class, 'index']);
    Route::get('/psychologist/tests/{id}', [PsychologistTestController::class, 'show']);
    Route::post('/psychologist/tests', [PsychologistTestController::class, 'store']);
    Route::put('/psychologist/tests/{id}', [PsychologistTestController::class, 'update']);
    Route::delete('/psychologist/tests/{id}', [PsychologistTestController::class, 'destroy']);
    Route::post('/psychologist/tests/upload-coloring', [PsychologistTestController::class, 'uploadColoring']);
  
    // Результаты тестов
    Route::get('/psychologist/test-results', [PsychologistTestResultController::class, 'index']);
    Route::get('/psychologist/test-results/{attempt}/compare', [PsychologistTestResultController::class, 'compare']);
    Route::get('/psychologist/test-results/{attempt}/export', [PsychologistTestResultController::class, 'exportPdf']);
    Route::get('/psychologist/test-results/{attempt}', [PsychologistTestResultController::class, 'show']);
    Route::put('/psychologist/test-results/{attempt}/superpowers', [PsychologistTestResultController::class, 'updateSuperpowers']);
    Route::delete('/psychologist/test-results/{attempt}', [PsychologistTestResultController::class, 'destroy']);

    // Наставник
    Route::get('/mentor/dashboard', [MentorDashboardController::class, 'index']);

    Route::get('/mentor/children', [MentorChildController::class, 'index']);
    Route::post('/mentor/children/{id}/reset-password', [MentorChildController::class, 'resetPassword']);
    Route::get('/mentor/moods', [MentorMoodController::class, 'index']);
    Route::get('/mentor/events', [MentorEventController::class, 'index']);
    Route::get('/mentor/events/{id}/attendance', [MentorEventController::class, 'attendance']);
    Route::post('/mentor/events/{id}/attendance', [MentorEventController::class, 'saveAttendance']);

    Route::post('/mentor/events', [MentorEventController::class, 'store']);
    Route::put('/mentor/events/{id}', [MentorEventController::class, 'update']);
    Route::delete('/mentor/events/{id}', [MentorEventController::class, 'destroy']);

});