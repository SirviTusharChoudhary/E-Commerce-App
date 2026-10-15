import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Loader2, Package, ArrowRight, Heart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { axiosInstance } from "../axiosCalls/axios.js";

export default function ProductCard({ product, isWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, actionLoading, getItemQuantity } = useCart();
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [saved, setSaved] = useState(isWishlisted);

  const handleNavigate = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    if (saved) {
      navigate("/wishlist");
      return;
    }

    if (wishlistSaving) return;

    try {
      setWishlistSaving(true);
      await axiosInstance.post(`/wishlist/${product._id}`);
      setSaved(true);
      if (onWishlistChange) onWishlistChange(product._id, true);
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistSaving(false);
    }
  };

  const isAdding = !!actionLoading[product._id];
  const cartQty = getItemQuantity(product._id);
  const isInCart = cartQty > 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxStock = isInCart && cartQty >= product.stock;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding || isOutOfStock || isMaxStock) return;

    if (!user) {
      navigate("/login");
      return;
    }

    await addToCart(product._id);
  };

  const formattedPrice =
    typeof product.price === "number"
      ? `₹${product.price.toLocaleString("en-IN")}`
      : `₹${product.price}`;

  return (
    <div
      onClick={handleNavigate}
      className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-black/60 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden flex items-center justify-center p-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-400 gap-2 p-4">
            <Package size={36} className="stroke-[1.5]" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Wishlist Heart Button (Lab-04 Task 5) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={wishlistSaving}
          className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm z-10 ${
            saved
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400"
              : "bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:scale-110"
          }`}
          title={saved ? "In Wishlist (click to view)" : "Add to Wishlist"}
          aria-label={saved ? "In Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={15}
            className={saved ? "fill-current text-rose-600 dark:text-rose-400" : ""}
          />
        </button>

        {/* Stock Badge overlay */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs backdrop-blur-md ${
              product.stock > 0
                ? "bg-black/90 text-white dark:bg-white/90 dark:text-black"
                : "bg-rose-500 text-white"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Sold Out"}
          </span>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="font-semibold text-xs text-black dark:text-white group-hover:underline line-clamp-1 mt-0.5">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-sm font-black text-black dark:text-white mt-1">
            {formattedPrice}
          </p>
        </div>

        {/* Action Buttons: Add to Cart (Task 7) & View Details */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100 dark:border-zinc-800">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || isMaxStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOutOfStock
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                : isInCart
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
            }`}
            title={
              isOutOfStock
                ? "Out of stock"
                : isMaxStock
                ? "Max stock reached"
                : isInCart
                ? "Add another unit"
                : "Add to cart"
            }
          >
            {isAdding ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : isMaxStock ? (
              <span>Max Added</span>
            ) : isInCart ? (
              <>
                <Check size={12} />
                <span>Add Another ({cartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={12} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="p-1.5 rounded border border-neutral-200 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="View Details"
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
