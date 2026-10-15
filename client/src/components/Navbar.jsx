import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { axiosInstance } from "../axiosCalls/axios.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { totalUnits } = useCart();
  const navigate = useNavigate();
  const [cartBump, setCartBump] = useState(false);

  // Trigger subtle micro-animation whenever totalUnits changes
  useEffect(() => {
    if (totalUnits > 0) {
      setCartBump(true);
      const timer = setTimeout(() => setCartBump(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalUnits]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customer/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Main Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/products"
            className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            bazr<span className="text-neutral-500 font-bold">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link
              to="/wishlist"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
            >
              Wishlist
            </Link>
            <Link
              to="/cart"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Cart</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full transition-all duration-300 ${
                  totalUnits > 0
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                } ${cartBump ? "scale-125" : ""}`}
              >
                {totalUnits}
              </span>
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
              >
                Orders
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Cart Icon Link (Mobile & Desktop quick access) */}
          <Link
            to="/cart"
            className={`flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all ${
              cartBump ? "scale-105 border-black dark:border-white shadow-xs" : ""
            }`}
            title="Shopping Cart"
          >
            <ShoppingCart size={15} />
            <span
              className={`text-[11px] font-bold rounded-full px-1.5 py-0.2 transition-transform duration-300 ${
                totalUnits > 0
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              } ${cartBump ? "scale-125" : ""}`}
            >
              {totalUnits}
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <UserIcon size={14} className="text-zinc-500 dark:text-zinc-400" />
                <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-xs font-semibold bg-zinc-950 dark:bg-white text-white dark:text-black rounded-full px-4 py-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
