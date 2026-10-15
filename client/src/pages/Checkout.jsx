import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { axiosInstance } from "../axiosCalls/axios.js";
import Navbar from "../components/Navbar.jsx";

// Utility to load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalUnits, subtotal, clearCart, loading: cartLoading } = useCart();

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState(null);

  // If cart is empty and not loading, redirect to cart
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, cartLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!shippingAddress.fullName || !shippingAddress.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    const cleanPhone = shippingAddress.phone.trim().replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid phone number (at least 10 digits).";
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.addressLine1.trim()) {
      errors.addressLine1 = "Street address is required.";
    }

    if (!shippingAddress.city || !shippingAddress.city.trim()) {
      errors.city = "City is required.";
    }

    if (!shippingAddress.state || !shippingAddress.state.trim()) {
      errors.state = "State is required.";
    }

    const cleanPincode = shippingAddress.pincode.trim();
    if (!cleanPincode) {
      errors.pincode = "Pincode is required.";
    } else if (!/^[0-9]{6}$/.test(cleanPincode)) {
      errors.pincode = "Pincode must contain exactly 6 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);
    setPaymentNotice(null);

    // 1. Client-side validation check
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Request backend to validate cart, stock, calculate total and create pending Razorpay order
      const response = await axiosInstance.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine1: shippingAddress.addressLine1.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
        },
      });

      const {
        shopKartOrderId,
        razorpayOrderId,
        amount,
        currency,
        key,
      } = response.data;

      // 3. Load Razorpay Standard Checkout script dynamically
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        setIsSubmitting(false);
        setServerError("Could not load Razorpay payment SDK. Please check your internet connection.");
        return;
      }

      // 4. Configure Razorpay Standard Checkout options as per Lab-06 Step 10
      const options = {
        key: key || "rzp_test_placeholder",
        amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: user?.email || "",
        },
        notes: {
          shopKartOrderId,
        },
        theme: {
          color: "#09090b",
        },
        handler: async function (paymentResponse) {
          try {
            setIsSubmitting(true);
            setPaymentNotice({
              type: "info",
              text: "Payment received. Verifying cryptographic signature with server...",
            });

            // 5. Send payment details to backend for HMAC SHA256 signature verification as per Lab-06 Step 11
            const verifyRes = await axiosInstance.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // 6. Clear global client-side cart state
              clearCart();
              // 7. Navigate to order confirmation
              navigate(`/order-success/${shopKartOrderId}`, {
                state: { newlyCreated: true },
              });
            } else {
              setServerError(verifyRes.data.message || "Payment verification failed.");
            }
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
                "Payment signature verification failed. Your cart has been preserved."
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentNotice({
              type: "warning",
              text: "Payment window was dismissed. Your cart has not been cleared.",
            });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (failResponse) {
        console.error("Razorpay payment failed:", failResponse.error);
        setIsSubmitting(false);
        setServerError(
          `Payment failed: ${failResponse.error?.description || "Transaction declined"}. Your cart has not been cleared.`
        );
      });

      setIsSubmitting(false);
      razorpayInstance.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      setIsSubmitting(false);
      const errMsg =
        err.response?.data?.message ||
        "Failed to initiate Razorpay order. Please review your cart and try again.";
      setServerError(errMsg);
    }
  };



  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-zinc-950 font-['Plus_Jakarta_Sans',sans-serif] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Subheader Breadcrumbs Banner */}
      <div className="bg-white dark:bg-zinc-900/50 border-b border-neutral-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Cart</span>
          </Link>
          <div className="text-neutral-400 dark:text-neutral-500">
            <span>Cart</span> / <span className="font-semibold text-zinc-800 dark:text-zinc-200">Checkout</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <div className="pb-5 border-b border-neutral-200 dark:border-zinc-800 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <span>Checkout</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full px-2.5 py-0.5">
              Secure
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Enter your shipping destination and complete payment using Razorpay Test Mode.
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{serverError}</div>
          </div>
        )}

        {/* Payment Notice / Feedback */}
        {paymentNotice && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm animate-fade-in ${
              paymentNotice.type === "warning"
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300"
            }`}
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{paymentNotice.text}</div>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: SHIPPING DETAILS FORM */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 dark:border-zinc-800 mb-6">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">Shipping Details</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Where should we deliver your order?</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                      formErrors.fullName
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                    }`}
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                      formErrors.phone
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleInputChange}
                    placeholder="e.g. 22 MG Road, Apartment 4B"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                      formErrors.addressLine1
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                    }`}
                  />
                </div>
                {formErrors.addressLine1 && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.addressLine1}</p>
                )}
              </div>

              {/* City & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                      formErrors.city
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                      formErrors.state
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {formErrors.state && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Pincode (6 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 560001"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                    formErrors.pincode
                      ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-neutral-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.pincode}</p>
                )}
              </div>

              {/* Payment Method Notice */}
              <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 p-3 bg-neutral-100 dark:bg-zinc-800/60 rounded-xl text-neutral-600 dark:text-neutral-300">
                  <CreditCard size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-[11px] font-medium">
                    Payment Gateway: <strong>Razorpay Test Mode</strong> (UPI, Cards, NetBanking simulated).
                  </span>
                </div>
              </div>

              {/* Submit Button (Mobile / Bottom) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Payment Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Place Order & Pay ₹{subtotal.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY & ITEM SNAPSHOTS */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800">
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">Order Summary</h2>
                <span className="text-xs text-neutral-400">
                  {totalUnits} {totalUnits === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-neutral-100 dark:divide-zinc-800 max-h-64 overflow-y-auto pr-1 my-3">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  return (
                    <div
                      key={product._id || item._id}
                      className="py-3 flex items-center gap-3 text-xs"
                    >
                      <img
                        src={product.image || "https://placehold.co/80"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-neutral-100 dark:bg-zinc-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {product.name}
                        </h4>
                        <div className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                          Qty: {item.quantity} × ₹{(product.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="font-bold text-zinc-950 dark:text-white">
                        ₹{((product.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-3 border-t border-neutral-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Payment Mode</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Razorpay Test</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-4 border-t border-neutral-200 dark:border-zinc-800 flex justify-between items-baseline mb-5">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400">
                    Total Amount
                  </span>
                  <span className="block text-[11px] text-neutral-400">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-black text-zinc-950 dark:text-white">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Security Badges */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-200/60 dark:border-zinc-800/80 flex items-center gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span>
                  Guaranteed safe checkout. Payments processed securely via Razorpay.
                </span>
              </div>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}
