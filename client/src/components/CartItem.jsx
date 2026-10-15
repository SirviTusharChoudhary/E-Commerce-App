import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Package, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const product = item?.product;

  if (!product) return null;

  const isUpdating = !!actionLoading[product._id];
  const unitPrice = Number(product.price) || 0;
  const itemTotal = unitPrice * item.quantity;
  const isAtMaxStock = item.quantity >= product.stock;

  const handleDecrease = () => {
    if (item.quantity > 1 && !isUpdating) {
      updateQuantity(product._id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < product.stock && !isUpdating) {
      updateQuantity(product._id, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    if (!isUpdating) {
      removeFromCart(product._id);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm ${
        isUpdating ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left: Thumbnail & Details */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link
            to={`/products/${product._id}`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200/70 dark:border-zinc-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center p-2 group hover:border-black dark:hover:border-white transition-colors"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
                }}
              />
            ) : (
              <Package size={28} className="text-neutral-400 stroke-[1.5]" />
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {product.category || "General"}
            </span>

            <Link
              to={`/products/${product._id}`}
              className="block font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:underline truncate"
            >
              {product.name}
            </Link>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                ₹{unitPrice.toLocaleString("en-IN")} each
              </span>
              <span className="text-neutral-300 dark:text-zinc-700">•</span>
              <span
                className={`text-[11px] font-medium ${
                  product.stock > 5
                    ? "text-emerald-600 dark:text-emerald-400"
                    : product.stock > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {isAtMaxStock && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
                <AlertCircle size={12} />
                <span>Maximum stock limit reached</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quantity controls & Total price */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-zinc-800">
          {/* Quantity Controls [-] Qty [+] */}
          <div className="flex items-center border border-neutral-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-neutral-50 dark:bg-zinc-800/60 shadow-2xs">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1 || isUpdating}
              className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={item.quantity <= 1 ? "Use Remove button to delete" : "Decrease quantity"}
            >
              <Minus size={13} />
            </button>

            <div className="w-10 text-center font-bold text-xs sm:text-sm text-black dark:text-white select-none">
              {item.quantity}
            </div>

            <button
              onClick={handleIncrease}
              disabled={isAtMaxStock || isUpdating}
              className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={isAtMaxStock ? "Stock limit reached" : "Increase quantity"}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Item Subtotal */}
          <div className="text-right min-w-[90px]">
            <div className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:block">Total</div>
            <div className="font-black text-sm sm:text-base text-zinc-950 dark:text-white">
              ₹{itemTotal.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-30"
            title="Remove item from cart"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
