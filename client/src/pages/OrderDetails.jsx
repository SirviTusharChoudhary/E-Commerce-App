import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { axiosInstance } from "../axiosCalls/axios.js";
import Navbar from "../components/Navbar.jsx";

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const isNewSuccess = location.pathname.includes("order-success") || location.state?.newlyCreated;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError(err.response?.data?.message || "Order not found or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Subheader Breadcrumbs Banner */}
      <div className="bg-white dark:bg-zinc-900/50 border-b border-neutral-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>All Orders</span>
          </Link>
          <div className="text-neutral-400 dark:text-neutral-500">
            <span>Orders</span> / <span className="font-semibold text-zinc-800 dark:text-zinc-200">#{id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400 dark:text-neutral-500">
            <div className="w-9 h-9 border-2 border-neutral-300 dark:border-zinc-700 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-xs font-medium animate-pulse">Loading order details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">Order not found</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">{error}</p>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <span>Back to My Orders</span>
            </Link>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Success Celebration Banner */}
            {isNewSuccess && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-950 dark:text-white">
                      Order Placed Successfully!
                    </h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                      Your order has been saved successfully. Payment is verified and inventory is confirmed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/orders"
                    className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-neutral-50 transition-colors"
                  >
                    View My Orders
                  </Link>
                  <Link
                    to="/products"
                    className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}

            {/* Order Overview Header Card */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                      Order #{order._id}
                    </h1>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      {order.status || "PLACED"}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      Payment {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">
                    Total Amount
                  </span>
                  <div className="text-2xl font-black text-zinc-950 dark:text-white">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Split: Items List vs Shipping & Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Order Items Purchased (Snapshot data) */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white pb-3 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>Purchased Items ({order.items?.length})</span>
                  <span className="text-xs text-neutral-400 font-normal">Historical snapshot</span>
                </h3>

                <div className="divide-y divide-neutral-100 dark:divide-zinc-800">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 flex items-center gap-4 text-xs">
                      <img
                        src={item.image || "https://placehold.co/100"}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl bg-neutral-100 dark:bg-zinc-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-950 dark:text-white text-sm truncate">
                          {item.name}
                        </h4>
                        <div className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                          Price snapshot: ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-zinc-950 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Standard Delivery</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-zinc-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-zinc-800">
                    <span>Total Paid</span>
                    <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address & Razorpay Transaction Meta */}
              <div className="lg:col-span-5 space-y-6">
                {/* Shipping Details */}
                <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-zinc-800 text-sm font-bold text-zinc-950 dark:text-white">
                    <MapPin size={16} className="text-neutral-500" />
                    <span>Shipping Address</span>
                  </div>

                  <div className="pt-3 text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300">
                    <p className="font-bold text-zinc-950 dark:text-white text-sm">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p className="pt-1 text-neutral-500 dark:text-neutral-400">
                      Phone: <strong>{order.shippingAddress?.phone}</strong>
                    </p>
                  </div>
                </div>

                {/* Payment Gateway Information */}
                <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-zinc-800 text-sm font-bold text-zinc-950 dark:text-white">
                    <CreditCard size={16} className="text-neutral-500" />
                    <span>Payment Information</span>
                  </div>

                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Method</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Razorpay Test</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {order.paymentStatus}
                      </span>
                    </div>

                    {order.razorpayOrderId && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500 dark:text-neutral-400">Razorpay Order ID</span>
                        <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                          {order.razorpayOrderId}
                        </span>
                      </div>
                    )}

                    {order.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500 dark:text-neutral-400">Payment ID</span>
                        <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                          {order.razorpayPaymentId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-neutral-500">
                    <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>Payment verified & secured via Razorpay</span>
                  </div>
                </div>

                {/* Continue Shopping / Back to Orders Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/orders"
                    className="flex-1 text-center py-3 px-4 rounded-xl border border-neutral-300 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    View All Orders
                  </Link>
                  <Link
                    to="/products"
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
