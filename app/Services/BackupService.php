<?php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class BackupService
{
    /**
     * Generate a SQL backup dump of the database.
     */
    public function createBackup(): Backup
    {
        $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/backups/' . $filename);

        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        $connection = config('database.default');
        $tables = DB::select('SHOW TABLES');
        $dbName = config("database.connections.{$connection}.database");
        $tableKey = "Tables_in_{$dbName}";

        $sqlContent = "-- POS Database Backup\n-- Generated at: " . now() . "\n\nSET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$tableKey ?? current((array)$tableObj);

            // Table structure
            $createTableStmt = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $sqlContent .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sqlContent .= $createTableStmt[0]->{'Create Table'} . ";\n\n";

            // Table data
            $rows = DB::table($tableName)->get();
            foreach ($rows as $row) {
                $rowArray = (array) $row;
                $values = array_map(function ($value) {
                    if (is_null($value)) return 'NULL';
                    return "'" . addslashes($value) . "'";
                }, $rowArray);

                $sqlContent .= "INSERT INTO `{$tableName}` (`" . implode('`, `', array_keys($rowArray)) . "`) VALUES (" . implode(', ', $values) . ");\n";
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
    public function restoreBackup(string $filename): bool
    {
        $path = storage_path('app/backups/' . $filename);
        if (!file_exists($path)) {
            throw new Exception("Backup file not found.");
        }

        $sql = file_get_contents($path);
        DB::unprepared($sql);

        return true;
    }
}
