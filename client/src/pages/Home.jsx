import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Search, LogOut, Heart, X, Check, AlertCircle } from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const categories = ["All", "Fashion", "Gadgets", "Home", "Books", "Outdoors", "Electronics"];

export default function Home() {
  const navigate = useNavigate();
  const { setUser, user } = useAuth();
  const { addToCart, totalUnits, actionLoading, getItemQuantity } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartBump, setCartBump] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [wishlistError, setWishlistError] = useState(null);
  const [addedItemMap, setAddedItemMap] = useState({});

  // Fetch Products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }

        const response = await axiosInstance.get(`/products/allProducts?${params.toString()}`);
        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Fetch current user's persistent wishlist from backend
  useEffect(() => {
    const fetchUserWishlist = async () => {
      try {
        const res = await axiosInstance.get("/wishlist");
        if (res.data?.wishlist) {
          const ids = new Set(res.data.wishlist.map((item) => item._id));
          setWishlist(ids);
        }
      } catch {
        // Not logged in or unauthenticated
      }
    };

    if (user) {
      fetchUserWishlist();
    } else {
      setWishlist(new Set());
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customer/logout");
      setUser(null);
      setWishlist(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login");
    }
  };

  const handleAddToWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlist.has(productId)) {
      // Already saved in wishlist, navigate to view wishlist
      navigate("/wishlist");
      return;
    }

    // Prevent duplicate requests while request is in flight
    if (wishlistLoading[productId]) return;

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    setWishlistError(null);

    try {
      await axiosInstance.post(`/wishlist/${productId}`);
      setWishlist((prev) => {
        const next = new Set(prev);
        next.add(productId);
        return next;
      });
    } catch (err) {
      console.error("Wishlist operation failed:", err);
      const msg = err.response?.data?.message || "Unable to save product. Please try again.";
      setWishlistError(msg);
      setTimeout(() => setWishlistError(null), 3500);
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddProduct = async (e, productId) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    const res = await addToCart(productId);
    if (res?.success) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 300);
      setAddedItemMap((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedItemMap((prev) => ({ ...prev, [productId]: false }));
      }, 1500);
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

      {/* COMPACT MAIN HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-colors">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-xl font-black tracking-tighter text-black dark:text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-sm font-black tracking-normal">B</span>
            <span>BAZR</span>
          </Link>
        </div>

        {/* SEARCH BAR (HIGH DENSITY) */}
        <div className="flex-1 max-w-xl relative">
          <div className="flex items-center border border-neutral-300 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-zinc-400 rounded overflow-hidden transition-colors bg-neutral-50/50 dark:bg-zinc-900/60">
            <Search size={15} className="ml-3 text-neutral-400 dark:text-zinc-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 70+ products, categories, tech, fashion…"
              className="w-full bg-transparent px-3 py-1.5 text-xs text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white mr-1 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
            <button
              onClick={() => navigate("/products")}
              className="bg-black dark:bg-white text-white dark:text-black px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* USER & BAG ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <Link
            to="/products"
            className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            All Catalog
          </Link>

          {/* WISHLIST BUTTON WITH LIVE BADGE */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            title="My Wishlist"
          >
            <Heart size={15} className={`text-rose-500 ${wishlist.size > 0 ? "fill-rose-500" : ""}`} />
            <span className="hidden sm:inline">Wishlist</span>
            <span className="text-[11px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 rounded-full px-1.5 py-0.2">
              {wishlist.size}
            </span>
          </Link>

          <Link
            to="/cart"
            className={`flex items-center gap-1.5 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all ${
              cartBump ? "scale-105 border-black dark:border-white shadow-xs" : ""
            }`}
            title="Shopping Cart"
          >
            <ShoppingCart size={15} />
            <span className={`text-[11px] font-bold bg-black dark:bg-white text-white dark:text-black rounded-full px-1.5 py-0.2 transition-transform ${cartBump ? "animate-pop" : ""}`}>
              {totalUnits}
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-800 rounded px-2.5 py-1">
              <span>{user.fullName ? user.fullName.split(" ")[0] : "Account"}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 rounded border border-transparent hover:border-neutral-200 dark:border-zinc-800 text-neutral-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* COMPACT CATEGORY NAVIGATION STRIP */}
      <div className="bg-neutral-50 dark:bg-zinc-900/60 border-b border-neutral-200/80 dark:border-zinc-800/80 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {categories.map((c) => {
            const isSelected = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
                  isSelected
                    ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-800/90 shadow-2xs"
                    : "border-transparent text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN MARKETPLACE CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full animate-fade-in">
        {/* LAB-02 TASK 3: LOGGED-IN CUSTOMER PROFILE CARD */}
        {user && (
          <div className="mb-4 bg-gradient-to-r from-neutral-50 to-neutral-100/60 dark:from-zinc-900 dark:to-zinc-900/60 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-sm font-black text-black dark:text-white">
                  Welcome back, {user.fullName || "Member"}! 👋
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {user.fullName}
                  </span>
                  <span>•</span>
                  <span>{user.email}</span>
                  {user.phone && (
                    <>
                      <span>•</span>
                      <span>{user.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                Authenticated Member
              </span>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-neutral-200 dark:border-zinc-800 text-xs transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px]">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </span>
            <span className="text-neutral-400 dark:text-zinc-500 text-xs">
              ({products.length})
            </span>
          </div>
        </div>

        {/* PRODUCT LISTING (WITH ANIMATED SKELETON LOADERS) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col p-2.5 gap-2.5 animate-pulse"
              >
                <div className="aspect-[4/4.5] w-full bg-neutral-100 dark:bg-zinc-800 rounded relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                <div className="h-2.5 bg-neutral-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-3.5 bg-neutral-200 dark:bg-zinc-800 rounded w-4/5" />
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-5 bg-neutral-200 dark:bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-neutral-400 dark:text-zinc-500">
              <Search size={18} />
            </div>
            <h3 className="text-sm font-bold text-black dark:text-white">No products found</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              No items matching category "{selectedCategory}"{searchQuery ? ` and query "${searchQuery}"` : ""}.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs font-bold uppercase tracking-wider px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((p) => {
              const isWishlisted = wishlist.has(p._id);
              const isSaving = wishlistLoading[p._id];
              const isAdded = addedItemMap[p._id];

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/products/${p._id}`)}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 rounded-lg overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/60 shadow-2xs"
                >
                  {/* COMPACT IMAGE CONTAINER */}
                  <div className="aspect-[4/4.5] w-full bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-center p-2.5 relative overflow-hidden">
                    <img
                      src={p.image || p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
                    />

                    {/* LAB-04 WISHLIST BUTTON (ADD TO WISHLIST ONLY) */}
                    <button
                      onClick={(e) => handleAddToWishlist(e, p._id)}
                      disabled={isSaving}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-2xs transition-all active:scale-90 cursor-pointer disabled:opacity-50 ${
                        isWishlisted
                          ? "bg-rose-50 dark:bg-rose-950/80 text-rose-500"
                          : "bg-white/90 dark:bg-zinc-800/90 text-neutral-400 dark:text-zinc-400 hover:text-rose-500"
                      }`}
                      title={
                        isSaving
                          ? "Saving..."
                          : isWishlisted
                          ? "In Wishlist (Saved)"
                          : "Add to Wishlist"
                      }
                    >
                      {isSaving ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart
                          size={13}
                          className={`transition-transform duration-200 ${
                            isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                          }`}
                        />
                      )}
                    </button>

                    {p.stock !== undefined && (
                      <span
                        className={`absolute bottom-2 left-2 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded shadow-2xs ${
                          p.stock > 0
                            ? "bg-black/90 dark:bg-white/90 text-white dark:text-black"
                            : "bg-neutral-200 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {p.stock > 0 ? "In Stock" : "Sold Out"}
                      </span>
                    )}
                  </div>

                  {/* INFO (HIGH DENSITY) */}
                  <div className="p-2.5 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
                      <span className="font-bold uppercase tracking-wider truncate">{p.category}</span>
                    </div>

                    <h3 className="font-semibold text-xs text-black dark:text-white leading-snug line-clamp-1 group-hover:underline">
                      {p.name}
                    </h3>

                    <div className="mt-auto pt-2 flex items-baseline justify-between">
                      <div>
                        <span className="font-black text-sm text-black dark:text-white">₹{p.price}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 line-through ml-1.5">
                          ₹{Math.round(p.price * 1.2)}
                        </span>
                      </div>

                      {(() => {
                        const isAdding = !!actionLoading[p._id];
                        const inCartQty = getItemQuantity(p._id);
                        const isOutOfStock = p.stock <= 0;
                        const isMaxStock = inCartQty >= p.stock;

                        return (
                          <button
                            onClick={(e) => handleAddProduct(e, p._id)}
                            disabled={isAdding || isOutOfStock || isMaxStock}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isAdded
                                ? "bg-emerald-600 text-white animate-pop"
                                : inCartQty > 0
                                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                                : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-2xs"
                            }`}
                            title={
                              isOutOfStock
                                ? "Out of stock"
                                : isMaxStock
                                ? "Max stock reached"
                                : inCartQty > 0
                                ? `In cart (${inCartQty}). Click to add another`
                                : "Add to cart"
                            }
                          >
                            {isAdding ? (
                              <span>...</span>
                            ) : isAdded ? (
                              <>
                                <Check size={11} />
                                <span>Done</span>
                              </>
                            ) : isOutOfStock ? (
                              <span>Sold Out</span>
                            ) : inCartQty > 0 ? (
                              <span>+1 ({inCartQty})</span>
                            ) : (
                              "Add"
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* COMPACT FOOTER */}
      <footer className="border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 px-4 sm:px-6 py-4 mt-auto text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-black dark:text-white">BAZR.</span>
            <span>Verified Peer-to-Peer & Brand Marketplace</span>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">All Catalog</Link>
            <Link to="/wishlist" className="hover:text-black dark:hover:text-white transition-colors">Saved Wishlist ({wishlist.size})</Link>
            <Link to="/home" className="hover:text-black dark:hover:text-white transition-colors">Home Feed</Link>
            <span className="text-neutral-400 dark:text-zinc-600">Fast Express Shipping • 100% Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}