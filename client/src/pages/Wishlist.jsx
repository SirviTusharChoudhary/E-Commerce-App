import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ShoppingCart, ArrowLeft, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useCart } from "../context/CartContext.jsx";
import WishlistCard from "../components/WishlistCard.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Wishlist() {
  const navigate = useNavigate();
  const { totalUnits } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError(
        err.response?.data?.message || "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove product from wishlist:", err);
      alert(err.response?.data?.message || "Failed to remove item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-black dark:text-zinc-100 antialiased flex flex-col transition-colors duration-200">


      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <Link
            to="/home"
            className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black tracking-normal">B</span>
            <span>BAZR</span>
          </Link>
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-l border-neutral-200 dark:border-zinc-800 pl-3">
            Wishlist
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            to="/cart"
            className="flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart size={15} />
            <span>Cart</span>
            <span className="text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 rounded-full px-1.5 py-0.2">
              {totalUnits}
            </span>
          </Link>

          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            Explore Catalog
          </Link>

          <Link
            to="/home"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
          >
            Home
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full animate-fade-in">
        {/* TITLE & COUNT BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-6 border-b border-neutral-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-rose-500 fill-rose-500" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                My Wishlist
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Saved items are backed by MongoDB and remain accessible across all your devices
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 text-xs font-bold self-start sm:self-center">
              <span>{wishlist.length}</span>
              <span>{wishlist.length === 1 ? "product saved" : "products saved"}</span>
            </div>
          )}
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-4">
              <div className="w-4 h-4 border-2 border-neutral-300 dark:border-zinc-700 border-t-black dark:border-t-white rounded-full animate-spin" />
              <span>Loading your wishlist...</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl overflow-hidden p-3.5 space-y-3 animate-pulse"
                >
                  <div className="aspect-4/3 w-full bg-neutral-100 dark:bg-zinc-800 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                  <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded w-4/5" />
                  <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded w-1/4" />
                  <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 flex gap-2">
                    <div className="h-7 bg-neutral-200 dark:bg-zinc-800 rounded flex-1" />
                    <div className="h-7 bg-neutral-200 dark:bg-zinc-800 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-black dark:text-white">
              Something went wrong.
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
              We couldn't load your wishlist. {error}
            </p>
            <button
              onClick={fetchWishlist}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <RefreshCw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Heart size={32} className="fill-rose-500 text-rose-500" />
            </div>
            <h2 className="text-lg font-black text-black dark:text-white">
              Your wishlist is empty ❤️
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              Save products you love while browsing and find them here anytime.
            </p>
            <div className="pt-5">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-2xs active:scale-95"
              >
                <ShoppingBag size={15} />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. SUCCESS STATE: GRID OF SAVED PRODUCTS */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((item) => (
              <WishlistCard
                key={item._id}
                product={item}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 px-4 sm:px-6 py-4 mt-auto text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-black dark:text-white">BAZR.</span>
            <span>Verified Peer-to-Peer & Brand Marketplace</span>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">Catalog</Link>
            <Link to="/home" className="hover:text-black dark:hover:text-white transition-colors">Home Feed</Link>
            <span className="text-neutral-400 dark:text-zinc-600">ShopKart Lab-04 Specification Complete</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
