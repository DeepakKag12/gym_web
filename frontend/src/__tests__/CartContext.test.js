import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('recovers safely from non-array object in localStorage without throwing', () => {
    localStorage.setItem('cart', JSON.stringify({ invalid: 'object' }));

    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(Array.isArray(result.current.cart)).toBe(true);
    expect(result.current.cart).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.count).toBe(0);
  });

  test('recovers safely from string or number in localStorage', () => {
    localStorage.setItem('cart', '12345');

    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(Array.isArray(result.current.cart)).toBe(true);
    expect(result.current.cart).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  test('adds item to cart and calculates total and count correctly', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    const product1 = {
      _id: 'p1',
      name: 'Whey Protein',
      price: 2500,
      discountPrice: 2200,
    };

    act(() => {
      result.current.addToCart(product1, 2, 'Chocolate', '1kg');
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.count).toBe(2);
    // 2200 * 2 = 4400
    expect(result.current.total).toBe(4400);

    // Add same product with same flavor and weight -> increments qty
    act(() => {
      result.current.addToCart(product1, 1, 'Chocolate', '1kg');
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(3);
    expect(result.current.count).toBe(3);
    expect(result.current.total).toBe(6600);

    // Add same product with different flavor -> adds as separate line
    act(() => {
      result.current.addToCart(product1, 1, 'Vanilla', '1kg');
    });

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.count).toBe(4);
    expect(result.current.total).toBe(8800);
  });

  test('updates quantity and removes item when qty < 1', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    const product = { _id: 'p1', name: 'Creatine', price: 1000 };

    act(() => {
      result.current.addToCart(product, 2, 'Unflavored', '250g');
    });

    act(() => {
      result.current.updateQty('p1', 'Unflavored', '250g', 5);
    });
    expect(result.current.cart[0].qty).toBe(5);
    expect(result.current.total).toBe(5000);

    // Reduce to 0 -> should remove item
    act(() => {
      result.current.updateQty('p1', 'Unflavored', '250g', 0);
    });
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.count).toBe(0);
  });

  test('removes item from cart with removeFromCart and clears cart with clearCart', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    const p1 = { _id: 'p1', name: 'Item 1', price: 500 };
    const p2 = { _id: 'p2', name: 'Item 2', price: 800 };

    act(() => {
      result.current.addToCart(p1, 1, 'F1', 'W1');
      result.current.addToCart(p2, 2, 'F2', 'W2');
    });
    expect(result.current.cart).toHaveLength(2);

    act(() => {
      result.current.removeFromCart('p1', 'F1', 'W1');
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]._id).toBe('p2');

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.cart).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});
