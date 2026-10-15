import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ShoppingCart,
  Heart,
  Check,
  Plus,
  Minus,
  Star,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateQuantity, totalUnits, actionLoading, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.product || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch user's wishlist to check saved state for this product
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const res = await axiosInstance.get("/wishlist");
        if (res.data?.wishlist) {
          setWishlistCount(res.data.wishlist.length);
          const isSaved = res.data.wishlist.some((item) => item._id === id);
          setWishlisted(isSaved);
        }
      } catch {
        // Guest or unauthenticated
      }
    };

    if (user && id) {
      checkWishlistStatus();
    } else {
      setWishlisted(false);
      setWishlistCount(0);
    }
  }, [user, id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const currentInCart = getItemQuantity(id);
    if (currentInCart > 0) {
      const targetQty = Math.min(product.stock, currentInCart + quantity);
      const res = await updateQuantity(id, targetQty);
      if (res?.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
      }
    } else {
      const res = await addToCart(id);
      if (res?.success) {
        if (quantity > 1) {
          await updateQuantity(id, Math.min(product.stock, quantity));
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
      }
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlisted) {
      navigate("/wishlist");
      return;
    }

    if (wishlistSaving) return;

    setWishlistSaving(true);
    setWishlistError(null);

    try {
      await axiosInstance.post(`/wishlist/${id}`);
      setWishlisted(true);
      setWishlistCount((c) => c + 1);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      const msg = err.response?.data?.message || "Unable to save to wishlist. Please try again.";
      setWishlistError(msg);
      setTimeout(() => setWishlistError(null), 3500);
    } finally {
      setWishlistSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-black dark:text-zinc-100 antialiased flex flex-col transition-colors duration-200">
      {/* TOAST ERROR NOTIFICATION */}
      {wishlistError && (
        <div className="fixed bottom-4 right-4 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <AlertCircle size={15} />
          <span>{wishlistError}</span>
        </div>
      )}

      {/* COMPACT MARKETPLACE NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black tracking-normal">B</span>
            <span>BAZR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">All Products</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* THEME TOGGLE BUTTON */}
          <ThemeToggle />

          {/* WISHLIST BUTTON LINK WITH LIVE BADGE */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            title="My Wishlist"
          >
            <Heart size={15} className={`text-rose-500 ${wishlistCount > 0 ? "fill-rose-500" : ""}`} />
            <span className="hidden sm:inline">Wishlist</span>
            <span className="text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 rounded-full px-1.5 py-0.2">
              {wishlistCount}
            </span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <ShoppingCart size={15} />
            <span>Bag</span>
            <span className="text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 rounded-full px-1.5 py-0.2">
              {totalUnits}
            </span>
          </Link>
        </div>
      </header>

      {/* COMPACT BREADCRUMBS */}
      <div className="bg-neutral-50 dark:bg-zinc-900/60 border-b border-neutral-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} className="text-neutral-400 dark:text-neutral-600" />
          <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">Products</Link>
          {product && (
            <>
              <ChevronRight size={12} className="text-neutral-400 dark:text-neutral-600" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">{product.category}</span>
              <ChevronRight size={12} className="text-neutral-400 dark:text-neutral-600" />
              <span className="text-black dark:text-white font-semibold truncate max-w-[200px]">{product.name}</span>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full animate-fade-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400 dark:text-neutral-500 text-xs">
            <div className="w-8 h-8 border-2 border-neutral-200 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin" />
            <span className="animate-pulse">Loading product specification…</span>
          </div>
        ) : error || !product ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="inline-block p-3 rounded-full bg-neutral-100 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 mb-3">
              <ShoppingCart size={24} />
            </div>
            <h2 className="text-base font-bold text-black dark:text-white">Product Not Available</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{error || "The item requested is currently not listed."}</p>
            <Link
              to="/products"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors shadow-2xs"
            >
              Browse Full Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT: PRODUCT IMAGE */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl overflow-hidden relative group shadow-sm transition-all duration-300">
                <div className="aspect-[4/4.5] w-full bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-center p-6 relative overflow-hidden">
                  <img
                    src={product.image || product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                {product.stock !== undefined && (
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs flex items-center gap-1.5 ${
                      product.stock > 0
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-neutral-200 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {product.stock > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT: MARKETPLACE INFO & PURCHASE CONTROLS */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col gap-4">
              {/* BRAND / CATEGORY & TITLE */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold uppercase tracking-widest text-[11px] text-neutral-400 dark:text-neutral-500">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-black dark:text-white">4.8</span>
                    <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">(142 reviews)</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* PRICING BLOCK */}
              <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-3.5 flex items-baseline justify-between transition-colors">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">₹{product.price}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">₹{Math.round(product.price * 1.25)}</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-1.5 py-0.2 rounded">
                      20% OFF
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 block mt-0.5">
                    Inclusive of all taxes • Free express shipping eligible
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-bold uppercase ${product.stock > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} units)` : "Sold Out"}
                  </span>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="space-y-3 pt-1">
                {product.stock > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Quantity:</span>
                    <div className="flex items-center border border-neutral-300 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3.5 text-xs font-bold text-black dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || !!actionLoading[id]}
                    className={`flex-1 py-3 px-5 rounded text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
                      added
                        ? "bg-emerald-600 text-white animate-pop"
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                    }`}
                  >
                    {actionLoading[id] ? (
                      <span>Adding to Bag...</span>
                    ) : added ? (
                      <>
                        <Check size={16} className="animate-scale-up" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>Add to Bag • ₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                      </>
                    )}
                  </button>

                  {/* LAB-04 ADD TO WISHLIST BUTTON */}
                  <button
                    onClick={handleAddToWishlist}
                    disabled={wishlistSaving}
                    className={`py-3 px-5 rounded text-xs font-extrabold uppercase tracking-wider border-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                      wishlisted
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60"
                        : "border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                    }`}
                    title={wishlisted ? "View in Wishlist" : "Save to Wishlist"}
                  >
                    {wishlistSaving ? (
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart
                        size={15}
                        className={wishlisted ? "fill-rose-500 text-rose-500" : ""}
                      />
                    )}
                    <span>
                      {wishlistSaving
                        ? "Saving..."
                        : wishlisted
                        ? "In Wishlist (View) ♥"
                        : "Add to Wishlist"}
                    </span>
                  </button>
                </div>
              </div>

              {/* SPECIFICATION & DETAILS TABLE (PRODUCT ID REMOVED) */}
              <div className="border border-neutral-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs divide-y divide-neutral-200 dark:divide-zinc-800 mt-2 bg-white dark:bg-zinc-900 transition-colors">
                <div className="bg-neutral-100/70 dark:bg-zinc-800/80 px-3.5 py-2 font-bold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
                  Product Specifications
                </div>
                <div className="px-3.5 py-2.5 grid grid-cols-3 gap-2">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium">Category</span>
                  <span className="col-span-2 font-semibold text-black dark:text-white">{product.category}</span>
                </div>
                <div className="px-3.5 py-2.5 grid grid-cols-3 gap-2">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium">Availability</span>
                  <span className="col-span-2 font-semibold text-black dark:text-white">
                    {product.stock > 0 ? "Ready to Dispatch" : "Temporarily Out of Stock"}
                  </span>
                </div>
                <div className="px-3.5 py-3">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium block mb-1">Description</span>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line text-xs">
                    {product.description || "Premium quality build manufactured with precision materials and strict quality control standards."}
                  </p>
                </div>
              </div>


            </div>
          </div>
        )}
      </main>

      {/* COMPACT FOOTER */}
      <footer className="border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 px-4 sm:px-6 py-4 mt-auto text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-black dark:text-white">© {new Date().getFullYear()} BAZR Marketplace. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">All Catalog</Link>
            <Link to="/wishlist" className="hover:text-black dark:hover:text-white transition-colors">Wishlist ({wishlistCount})</Link>
            <Link to="/home" className="hover:text-black dark:hover:text-white transition-colors">Store Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
