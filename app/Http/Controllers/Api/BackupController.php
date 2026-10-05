<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Services\BackupService;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    protected BackupService $backupService;

    public function __construct(BackupService $backupService)
    {
        $this->backupService = $backupService;
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
            'filename' => 'required|string',
        ]);

        // Create safety backup before restore
        $this->backupService->createBackup();

        $this->backupService->restoreBackup($validated['filename']);

        return response()->json(['message' => 'Database berhasil di-restore']);
    }

    public function download($id)
    {
        $backup = Backup::findOrFail($id);
        $path = storage_path('app/backups/' . $backup->filename);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return response()->download($path);
    }
}
