import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [productId]: boolean }
  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const showFeedback = useCallback((text, type = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev?.text === text ? null : prev));
    }, 3000);
  }, []);

  // Fetch current user's persistent cart from MongoDB
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/cart");
      setCartItems(response.data.cart || []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      const msg = err.response?.data?.message || "Unable to load your cart.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Synchronize cart whenever auth state changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setError(null);
      setLoading(false);
    }
  }, [user, fetchCart]);

  // Derived: Total item count / total units across all cart items
  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  // Alias cartCount to totalUnits for Navbar & badge compatibility
  const cartCount = totalUnits;

  // Derived: Subtotal dynamically calculated as Σ(product.price * quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  // Helper: check if product exists in cart
  const isItemInCart = useCallback((productId) => {
    return cartItems.some((item) => (item.product?._id || item.product) === productId);
  }, [cartItems]);

  // Helper: get current quantity of product in cart
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find((item) => (item.product?._id || item.product) === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Add product to cart (or increment if already exists)
  const addToCart = useCallback(async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: "Please log in to add items to your cart." };
    }

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: true }));
      const response = await axiosInstance.post(`/cart/${productId}`);
      const updatedCart = response.data.cart || [];
      setCartItems(updatedCart);
      showFeedback("Added to cart successfully!", "success");
      return { success: true, cart: updatedCart };
    } catch (err) {
      console.error("Failed to add to cart:", err);
      const msg = err.response?.data?.message || "Failed to add product to cart.";
      showFeedback(msg, "error");
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }, [user, showFeedback]);

  // Update quantity of specific cart product
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (!user) return { success: false, message: "Authentication required" };

    if (newQuantity < 1) {
      return { success: false, message: "Quantity must be at least 1" };
    }

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: true }));
      const response = await axiosInstance.patch(`/cart/${productId}`, {
        quantity: newQuantity,
      });
      const updatedCart = response.data.cart || [];
      setCartItems(updatedCart);
      return { success: true, cart: updatedCart };
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      const msg = err.response?.data?.message || "Failed to update item quantity.";
      showFeedback(msg, "error");
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }, [user, showFeedback]);

  // Remove product from cart
  const removeFromCart = useCallback(async (productId) => {
    if (!user) return { success: false, message: "Authentication required" };

    try {
      setActionLoading((prev) => ({ ...prev, [productId]: true }));
      const response = await axiosInstance.delete(`/cart/${productId}`);
      const updatedCart = response.data.cart || [];
      setCartItems(updatedCart);
      showFeedback("Item removed from cart.", "success");
      return { success: true, cart: updatedCart };
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      const msg = err.response?.data?.message || "Failed to remove item from cart.";
      showFeedback(msg, "error");
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }, [user, showFeedback]);

  // Instantly clear cart in local state (used after verified payment)
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    actionLoading,
    totalUnits,
    cartCount,
    subtotal,
    isItemInCart,
    getItemQuantity,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    feedbackMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
