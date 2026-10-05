import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');

    const addToCart = (item, qty = 1) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((i) => i.item_id === item.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += qty;
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        item_id: item.id,
                        name: item.name,
                        type: item.type,
                        unit_price: parseFloat(item.selling_price),
                        purchase_price: parseFloat(item.purchase_price),
                        quantity: qty,
                        stock: parseFloat(item.stock),
                        track_stock: item.track_stock,
                        discount: 0,
                        tax: 0,
                    },
                ];
            }
        });
    };

    const updateQuantity = (itemId, qty) => {
        if (qty <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((i) => (i.item_id === itemId ? { ...i, quantity: qty } : i))
        );
    };

    const updatePrice = (itemId, price) => {
        setCart((prev) =>
            prev.map((i) => (i.item_id === itemId ? { ...i, unit_price: parseFloat(price) || 0 } : i))
        );
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((i) => i.item_id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setTaxRate(0);
        setNotes('');
    };

    const loadHeldTransaction = (sale) => {
        setCustomer(sale.customer || null);
        setDiscount(parseFloat(sale.discount) || 0);
        setTaxRate(parseFloat(sale.tax) || 0);
        setNotes(sale.notes || '');

        const items = sale.items.map((si) => ({
            item_id: si.item_id,
            name: si.item_name,
            type: si.item ? si.item.type : 'PRODUCT',
            unit_price: parseFloat(si.unit_price),
            purchase_price: parseFloat(si.purchase_price),
            quantity: parseFloat(si.quantity),
            stock: si.item ? parseFloat(si.item.stock) : 0,
            track_stock: si.item ? si.item.track_stock : false,
            discount: parseFloat(si.discount) || 0,
            tax: parseFloat(si.tax) || 0,
        }));

        setCart(items);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const grandTotal = Math.max(0, subtotal - discount + (taxAmount > 0 ? taxAmount : 0));

    return (
        <CartContext.Provider
            value={{
                cart,
                customer,
                setCustomer,
                discount,
                setDiscount,
                taxRate,
                setTaxRate,
                notes,
                setNotes,
                addToCart,
                updateQuantity,
                updatePrice,
                removeFromCart,
                clearCart,
                loadHeldTransaction,
                subtotal,
                grandTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
