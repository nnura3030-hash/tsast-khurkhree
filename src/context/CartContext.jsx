import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('tsast_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tsast_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    const cartId = `${item.type}-${item.id || item._id}-${Date.now()}`;
    setCartItems((prev) => [...prev, { ...item, cartId }]);
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;

        const useQuantity = ['product', 'medical', 'food'].includes(item.type);
        const currentQty = useQuantity ? (item.quantity || 1) : (item.peopleCount || 1);
        const newQty = Math.max(1, currentQty + delta);

        if (newQty === currentQty) return item;

        // Үнийг пропорционалиар шинэчлэх
        const unitPrice = item.totalPrice / currentQty;
        const newTotalPrice = unitPrice * newQty;

        return useQuantity
          ? { ...item, quantity: newQty, totalPrice: newTotalPrice }
          : { ...item, peopleCount: newQty, totalPrice: newTotalPrice };
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalCartPrice }}>
      {children}
    </CartContext.Provider>
  );
};