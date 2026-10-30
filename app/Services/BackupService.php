<?php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BackupService
{
    private const BACKUP_DIRECTORY = 'app/backups';

    /**
     * Generate a SQL backup dump of the database.
     */
    public function createBackup(): Backup
    {
        $filename = 'backup_'.now()->format('Y-m-d_H-i-s').'.sql';
        $path = storage_path('app/backups/'.$filename);

        if (! file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        $connection = config('database.default');
        $tables = DB::select('SHOW TABLES');
        $dbName = config("database.connections.{$connection}.database");
        $tableKey = "Tables_in_{$dbName}";

        $sqlContent = "-- POS Database Backup\n-- Generated at: ".now()."\n\nSET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$tableKey ?? current((array) $tableObj);

            // Table structure
            $createTableStmt = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $sqlContent .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sqlContent .= $createTableStmt[0]->{'Create Table'}.";\n\n";

            // Table data
            $rows = DB::table($tableName)->get();
            foreach ($rows as $row) {
                $rowArray = (array) $row;
                $values = array_map(function ($value) {
                    if (is_null($value)) {
                        return 'NULL';
                    }

                    return "'".addslashes($value)."'";
                }, $rowArray);

                $sqlContent .= "INSERT INTO `{$tableName}` (`".implode('`, `', array_keys($rowArray)).'`) VALUES ('.implode(', ', $values).");\n";
            }
            $sqlContent .= "\n";
        }

        $sqlContent .= "SET FOREIGN_KEY_CHECKS=1;\n";

        file_put_contents($path, $sqlContent);

        return Backup::create([
            'filename' => $filename,
            'size' => filesize($path),
            'status' => 'SUCCESS',
        ]);
    }

    /**
     * Restore database from backup SQL file.
     */
    public function restoreBackup(Backup $backup): bool
    {
        $path = $this->resolveBackupPath($backup);

        if (! is_file($path) || ! is_readable($path)) {
            throw ValidationException::withMessages([
                'backup_id' => 'File backup tidak ditemukan atau tidak dapat dibaca.',
            ]);
        }

        $sql = file_get_contents($path);
        if ($sql === false || ! str_starts_with(ltrim($sql), '-- POS Database Backup')) {
            throw ValidationException::withMessages([
                'backup_id' => 'File backup tidak valid.',
            ]);
        }

        DB::unprepared($sql);

        return true;
    }

    public function getBackupPath(Backup $backup): string
    {
        return $this->resolveBackupPath($backup);
    }

    private function resolveBackupPath(Backup $backup): string
    {
        $filename = $backup->filename;
        $backupDirectory = realpath(storage_path(self::BACKUP_DIRECTORY));

        if (
            blank($backupDirectory)
            || $filename !== basename($filename)
            || ! str_ends_with(strtolower($filename), '.sql')
        ) {
            throw ValidationException::withMessages([
                'backup_id' => 'Referensi file backup tidak valid.',
            ]);
        }

        $path = realpath($backupDirectory.DIRECTORY_SEPARATOR.$filename);
        if ($path === false || dirname($path) !== $backupDirectory) {
            throw ValidationException::withMessages([
                'backup_id' => 'Lokasi file backup tidak valid.',
            ]);
        }

        return $path;
    }
}
