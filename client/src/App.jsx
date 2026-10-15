import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>}></Route>
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>}></Route>
            <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>}></Route>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}></Route>
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}></Route>
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>}></Route>
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>}></Route>
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>}></Route>
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>}></Route>
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}></Route>
            <Route path="/order-success/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}></Route>
            <Route path="/products" element={<Products />}></Route>
            <Route path="/products/:id" element={<ProductDetails />}></Route>
            <Route path="/product/:id" element={<ProductDetails />}></Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
