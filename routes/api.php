<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UnitController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected API Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // POS
        Route::get('/pos/items', [PosController::class, 'items']);
        Route::post('/pos/checkout', [PosController::class, 'checkout']);
        Route::post('/pos/hold', [PosController::class, 'hold']);
        Route::get('/pos/held', [PosController::class, 'getHeld']);
        Route::delete('/pos/held/{sale}', [PosController::class, 'deleteHeld']);

        // Master Data
        Route::apiResource('items', ItemController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('units', UnitController::class);
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('suppliers', SupplierController::class);

        // Transactions & Refunds
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/{sale}', [TransactionController::class, 'show']);
        Route::post('/transactions/{sale}/cancel', [TransactionController::class, 'cancel']);
        Route::post('/transactions/{sale}/refund', [TransactionController::class, 'refund']);

        // Inventory
        Route::get('/inventory', [InventoryController::class, 'index']);
        Route::get('/inventory/movements', [InventoryController::class, 'movements']);
        Route::post('/inventory/adjustment', [InventoryController::class, 'adjustment']);

        // Shifts
        Route::get('/shifts/current', [ShiftController::class, 'current']);
        Route::post('/shifts/open', [ShiftController::class, 'open']);
        Route::post('/shifts/close', [ShiftController::class, 'close']);
        Route::get('/shifts', [ShiftController::class, 'index']);

        // Reports
        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/sales-chart', [ReportController::class, 'salesChart']);
        Route::get('/reports/top-products', [ReportController::class, 'topProducts']);

        // Settings & Backups
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);
        Route::get('/backups', [BackupController::class, 'index']);
        Route::post('/backups', [BackupController::class, 'create']);
        Route::post('/backups/restore', [BackupController::class, 'restore']);
        Route::get('/backups/{id}/download', [BackupController::class, 'download']);
    });
});
