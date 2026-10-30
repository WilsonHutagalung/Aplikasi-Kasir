<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Services\BackupService;
use Closure;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    protected BackupService $backupService;

    public function __construct(BackupService $backupService)
    {
        $this->backupService = $backupService;

        $this->middleware(function (Request $request, Closure $next) {
            abort_unless(
                $request->user()?->hasPermission('manage_backup'),
                403,
                'Anda tidak memiliki izin untuk mengelola backup.'
            );

            return $next($request);
        });
    }

    public function index()
    {
        return response()->json(Backup::latest()->get());
    }

    public function create()
    {
        $backup = $this->backupService->createBackup();

        return response()->json(['message' => 'Database backup berhasil dibuat', 'backup' => $backup]);
    }

    public function restore(Request $request)
    {
        $validated = $request->validate([
            'backup_id' => 'required|integer|exists:backups,id',
        ]);

        $backup = Backup::findOrFail($validated['backup_id']);

        // Create safety backup before restore
        $this->backupService->createBackup();

        $this->backupService->restoreBackup($backup);

        return response()->json(['message' => 'Database berhasil di-restore']);
    }

    public function download($id)
    {
        $backup = Backup::findOrFail($id);
        $path = $this->backupService->getBackupPath($backup);

        if (! is_file($path) || ! is_readable($path)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return response()->download($path);
    }
}
