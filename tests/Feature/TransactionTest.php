<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Item;
use App\Models\PaymentMethod;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\TransactionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_calculates_totals_and_deducts_stock_correctly()
    {
        $role = Role::create(['name' => 'cashier', 'display_name' => 'Cashier']);
        $user = User::create([
            'name' => 'Kasir Test',
            'username' => 'kasirtest',
            'email' => 'kasir@test.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $category = Category::create(['name' => 'Makanan']);
        $unit = Unit::create(['name' => 'Pcs', 'symbol' => 'pcs']);
        $paymentMethod = PaymentMethod::create(['name' => 'Cash', 'code' => 'CASH']);

        $productA = Item::create([
            'name' => 'Product A',
            'type' => 'PRODUCT',
            'sku' => 'SKU-A',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'purchase_price' => 5000,
            'selling_price' => 10000,
            'minimum_stock' => 5,
            'track_stock' => true,
            'stock' => 20,
        ]);

        $productB = Item::create([
            'name' => 'Product B',
            'type' => 'PRODUCT',
            'sku' => 'SKU-B',
            'category_id' => $category->id,
            'unit_id' => $unit->id,
            'purchase_price' => 10000,
            'selling_price' => 20000,
            'minimum_stock' => 2,
            'track_stock' => true,
            'stock' => 10,
        ]);

        $inventoryService = new InventoryService();
        $transactionService = new TransactionService($inventoryService);

        // Product A x2 = 20.000, Product B x1 = 20.000. Subtotal = 40.000, Discount = 5.000, Tax = 3.500 => Total = 38.500
        $saleData = [
            'discount' => 5000,
            'tax' => 3500,
            'paid_amount' => 50000,
            'items' => [
                ['item_id' => $productA->id, 'quantity' => 2, 'unit_price' => 10000],
                ['item_id' => $productB->id, 'quantity' => 1, 'unit_price' => 20000],
            ],
            'payments' => [
                ['payment_method_id' => $paymentMethod->id, 'amount' => 38500],
            ]
        ];

        $sale = $transactionService->checkout($saleData, $user->id);

        $this->assertEquals(40000, $sale->subtotal);
        $this->assertEquals(38500, $sale->total);
        $this->assertEquals(11500, $sale->change_amount);

        // Check stock deducted
        $this->assertEquals(18, $productA->fresh()->stock);
        $this->assertEquals(9, $productB->fresh()->stock);
    }
}
