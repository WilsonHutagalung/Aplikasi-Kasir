<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Dashboard
            ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'group' => 'dashboard'],
            
            // POS
            ['name' => 'create_transaction', 'display_name' => 'Create POS Transaction', 'group' => 'pos'],
            ['name' => 'view_transaction', 'display_name' => 'View Transactions', 'group' => 'pos'],
            ['name' => 'cancel_transaction', 'display_name' => 'Cancel Transaction', 'group' => 'pos'],
            ['name' => 'refund_transaction', 'display_name' => 'Refund Transaction', 'group' => 'pos'],
            
            // Master Data
            ['name' => 'manage_product', 'display_name' => 'Manage Products & Services', 'group' => 'master'],
            ['name' => 'manage_category', 'display_name' => 'Manage Categories', 'group' => 'master'],
            ['name' => 'manage_unit', 'display_name' => 'Manage Units', 'group' => 'master'],
            ['name' => 'manage_customer', 'display_name' => 'Manage Customers', 'group' => 'master'],
            ['name' => 'manage_supplier', 'display_name' => 'Manage Suppliers', 'group' => 'master'],
            
            // Inventory & Purchase
            ['name' => 'manage_inventory', 'display_name' => 'Manage Inventory & Stock', 'group' => 'inventory'],
            ['name' => 'manage_purchase', 'display_name' => 'Manage Purchases', 'group' => 'inventory'],
            
            // Shifts & Reports
            ['name' => 'manage_shift', 'display_name' => 'Manage Cashier Shifts', 'group' => 'shift'],
            ['name' => 'view_report', 'display_name' => 'View Sales & Profit Reports', 'group' => 'reports'],
            
            // Administration
            ['name' => 'manage_user', 'display_name' => 'Manage Users & Roles', 'group' => 'admin'],
            ['name' => 'manage_setting', 'display_name' => 'Manage Business Settings', 'group' => 'admin'],
            ['name' => 'manage_backup', 'display_name' => 'Manage Database Backup & Restore', 'group' => 'admin'],
            ['name' => 'view_audit_log', 'display_name' => 'View Audit Logs', 'group' => 'admin'],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[$p['name']] = Permission::firstOrCreate(
                ['name' => $p['name']],
                ['display_name' => $p['display_name'], 'group' => $p['group']]
            );
        }

        // Roles
        $ownerRole = Role::firstOrCreate(
            ['name' => 'owner'],
            ['display_name' => 'Owner', 'description' => 'Full access to all system features.']
        );

        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Admin', 'description' => 'Operational management access.']
        );

        $cashierRole = Role::firstOrCreate(
            ['name' => 'cashier'],
            ['display_name' => 'Cashier', 'description' => 'Transaction and shift access.']
        );

        // Assign permissions to Admin
        $adminPermissions = [
            'view_dashboard', 'create_transaction', 'view_transaction',
            'manage_product', 'manage_category', 'manage_unit',
            'manage_customer', 'manage_supplier', 'manage_inventory',
            'manage_purchase', 'manage_shift', 'view_report'
        ];
        $adminRole->permissions()->sync(
            Permission::whereIn('name', $adminPermissions)->pluck('id')
        );

        // Assign permissions to Cashier
        $cashierPermissions = [
            'view_dashboard', 'create_transaction', 'view_transaction',
            'manage_customer', 'manage_shift'
        ];
        $cashierRole->permissions()->sync(
            Permission::whereIn('name', $cashierPermissions)->pluck('id')
        );

        // Create default users
        User::firstOrCreate(
            ['username' => 'owner'],
            [
                'name' => 'Pemilik Toko (Owner)',
                'email' => 'owner@pos.local',
                'password' => Hash::make('password'),
                'role_id' => $ownerRole->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Operasional',
                'email' => 'admin@pos.local',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['username' => 'kasir'],
            [
                'name' => 'Budi Kasir',
                'email' => 'kasir@pos.local',
                'password' => Hash::make('password'),
                'role_id' => $cashierRole->id,
                'is_active' => true,
            ]
        );
    }
}
