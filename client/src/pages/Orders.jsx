import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import Navbar from "../components/Navbar.jsx";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          icon: <CheckCircle2 size={12} />,
          label: "Delivered",
        };
      case "SHIPPED":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          icon: <Truck size={12} />,
          label: "Shipped",
        };
      case "CONFIRMED":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
          icon: <CheckCircle2 size={12} />,
          label: "Confirmed",
        };
      case "PLACED":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
          icon: <Clock size={12} />,
          label: "Placed",
        };
      default:
        return {
          bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
          icon: <Clock size={12} />,
          label: status || "Pending",
        };
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === "PAID") {
      return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300";
    }
    if (paymentStatus === "FAILED") {
      return "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300";
    }
    return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300";
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5 border-b border-neutral-200 dark:border-zinc-800 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
              <span>My Orders</span>
              {!loading && (
                <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black rounded-full px-2.5 py-0.5">
                  {orders.length}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Track, view details, and manage your purchase history.
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400 dark:text-neutral-500">
            <div className="w-9 h-9 border-2 border-neutral-300 dark:border-zinc-700 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-xs font-medium animate-pulse">Loading your orders...</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">Unable to load orders</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">{error}</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">You have not placed any orders yet.</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 mb-6 max-w-xs mx-auto">
              Your previous purchases will show up here once you check out.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs active:scale-95"
            >
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-neutral-400 dark:hover:border-zinc-700 transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-950 dark:text-white">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                          >
                            {statusBadge.icon}
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{orderDate}</span>
                          </span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getPaymentBadge(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                          Total Amount
                        </div>
                        <div className="text-base font-black text-zinc-950 dark:text-white">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-all"
                      >
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800/80"
                      >
                        <img
                          src={item.image || "https://placehold.co/80"}
                          alt={item.name}
                          className="w-11 h-11 object-cover rounded-lg bg-neutral-200 dark:bg-zinc-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
