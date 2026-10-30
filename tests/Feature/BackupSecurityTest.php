<?php

namespace Tests\Feature;

use App\Models\Backup;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BackupSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_backup_path_rejects_directory_traversal(): void
    {
        $backup = Backup::create([
            'filename' => '../database.sqlite',
            'size' => 100,
            'status' => 'SUCCESS',
        ]);

        $this->expectException(ValidationException::class);

        (new BackupService)->getBackupPath($backup);
    }
}
