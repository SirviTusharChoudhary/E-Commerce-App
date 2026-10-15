import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Package, ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

export default function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const { addToCart, actionLoading, getItemQuantity } = useCart();

  const handleNavigate = () => {
    navigate(`/products/${product._id}`);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
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
    await addToCart(product._id);
  };

  const formattedPrice =
    typeof product.price === "number"
      ? `₹${product.price.toLocaleString("en-IN")}`
      : `₹${product.price}`;

  const stockStatus =
    product.stock > 0
      ? `${product.stock} units left`
      : "Out of stock";

  return (
    <div
      onClick={handleNavigate}
      className={`group bg-white dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-black/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer shadow-2xs ${
        removing ? "opacity-40 pointer-events-none scale-95" : ""
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full bg-neutral-50 dark:bg-zinc-900/60 overflow-hidden flex items-center justify-center p-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 gap-2 p-4">
            <Package size={36} className="stroke-[1.5]" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Stock status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs backdrop-blur-md ${
              product.stock > 0
                ? "bg-black/90 dark:bg-white/90 text-white dark:text-black"
                : "bg-rose-500 text-white"
            }`}
          >
            {stockStatus}
          </span>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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

          <p className={`text-[11px] font-medium mt-0.5 ${product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
            {product.stock > 0 ? "Ready to Dispatch" : "Temporarily Sold Out"}
          </p>
        </div>

        {/* Actions: Add to Cart & Remove from Wishlist */}
        <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || isMaxStock}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOutOfStock
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                : isInCart
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
            }`}
            title={
              isOutOfStock
                ? "Out of stock"
                : isMaxStock
                ? "Max stock reached"
                : isInCart
                ? "Add another unit"
                : "Move to cart"
            }
          >
            {isAdding ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : isInCart ? (
              <>
                <Check size={12} />
                <span>In Cart ({cartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={12} />
                <span>Move to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex items-center justify-center gap-1 border border-neutral-200 dark:border-zinc-800 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-bold uppercase tracking-wider py-1.5 px-2 rounded transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Remove from Wishlist"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
