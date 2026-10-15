import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import CartItem from "../components/CartItem.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    fetchCart,
    feedbackMessage,
  } = useCart();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Floating Action Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold text-white animate-fade-in ${
            feedbackMessage.type === "error" ? "bg-rose-600" : "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
          }`}
        >
          {feedbackMessage.type === "error" ? <AlertCircle size={15} /> : <Sparkles size={15} className="text-amber-400" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Subheader Breadcrumbs Banner */}
      <div className="bg-white dark:bg-zinc-900/50 border-b border-neutral-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
          <div className="text-neutral-400 dark:text-neutral-500">
            <span>Home</span> / <span>Products</span> / <span className="font-semibold text-zinc-800 dark:text-zinc-200">Cart</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title & Count */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5 border-b border-neutral-200 dark:border-zinc-800 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
              <span>My Cart</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black rounded-full px-2.5 py-0.5">
                {totalUnits} {totalUnits === 1 ? "Item" : "Items"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Review your items, update quantities, and proceed to checkout.
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400 dark:text-neutral-500">
            <div className="w-9 h-9 border-2 border-neutral-300 dark:border-zinc-700 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-xs font-medium animate-pulse">Loading your cart...</p>
          </div>
        ) : error && cartItems.length === 0 ? (
          /* ERROR STATE */
          <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">Unable to load your cart.</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={30} className="stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Your cart is empty 🛒</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 mb-6 max-w-xs mx-auto">
              Looks like you haven't added anything yet. Explore our latest products and build your cart.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs active:scale-95"
            >
              <span>Browse Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* ACTIVE CART CONTENT: 2-COLUMN LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: CART ITEMS LIST */}
            <div className="lg:col-span-8 flex flex-col gap-3.5">
              {cartItems.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}

              {/* Shopping Assurance Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800 text-xs">
                  <Truck size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-zinc-100">Free Express Delivery</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">On all prepaid orders</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800 text-xs">
                  <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-zinc-100">Genuine Guarantee</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">100% verified authentic</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800 text-xs">
                  <RotateCcw size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-zinc-100">Easy 7-Day Returns</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">No questions asked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY CARD */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs sticky top-24">
                <h2 className="text-base font-bold text-zinc-950 dark:text-white pb-3 border-b border-neutral-100 dark:border-zinc-800">
                  Order Summary
                </h2>

                <div className="py-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Items ({totalUnits})</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                  </div>

                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Taxes & Handling</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-zinc-800 flex justify-between items-baseline mb-5">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400">
                      Subtotal
                    </span>
                    <span className="block text-[11px] text-neutral-400">Includes all applicable duties</span>
                  </div>
                  <span className="text-xl font-black text-zinc-950 dark:text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Proceed to Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline transition-colors"
                  >
                    Or Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
