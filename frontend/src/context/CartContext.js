import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1, flavor = '', weight = '') => {
    setCart(prev => {
      const exists = prev.find(i => i._id === product._id && i.flavor === flavor && i.weight === weight);
      if (exists) return prev.map(i => i._id === product._id && i.flavor === flavor && i.weight === weight
        ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty, flavor, weight }];
    });
  };

  const removeFromCart = (id, flavor, weight) => {
    setCart(prev => prev.filter(i => !(i._id === id && i.flavor === flavor && i.weight === weight)));
  };

  const updateQty = (id, flavor, weight, qty) => {
    if (qty < 1) { removeFromCart(id, flavor, weight); return; }
    setCart(prev => prev.map(i => i._id === id && i.flavor === flavor && i.weight === weight ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
