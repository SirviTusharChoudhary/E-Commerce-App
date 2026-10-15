import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/products.model.js";
import razorpay from "../config/razorpay.js";


const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required.";
  }

  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (
    !fullName ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !pincode
  ) {
    return "All shipping address fields are required.";
  }

  if (
    !fullName.trim() ||
    !phone.trim() ||
    !addressLine1.trim() ||
    !city.trim() ||
    !state.trim() ||
    !pincode.trim()
  ) {
    return "Shipping address fields cannot be empty or whitespace only.";
  }

  const cleanPhone = phone.trim().replace(/[\s-]/g, "");
  if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
    return "Phone number must be valid (at least 10 digits).";
  }

  const cleanPincode = pincode.trim();
  if (!/^[0-9]{6}$/.test(cleanPincode)) {
    return "Pincode must contain 6 digits.";
  }

  return null;
};


export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError,
      });
    }

    // 2. Fetch fresh user & cart
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add items before checking out.",
      });
    }

    // 3. Load latest product data & verify stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of user.cart) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more items in your cart are no longer available.",
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}.`,
        });
      }

      totalAmount += product.price * item.quantity;

      // Purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    // 4. Create pending ShopKart order in MongoDB
    const cleanShippingAddress = {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim().replace(/[\s-]/g, ""),
      addressLine1: shippingAddress.addressLine1.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pincode.trim(),
    };

    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: cleanShippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await newOrder.save();

    // 5. Create Razorpay order (amount in paise) as per Lab-06 Step 7
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: newOrder._id.toString(),
    });

    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    // 6. Return safe checkout data as per Lab-06 Step 8
    return res.status(200).json({
      success: true,
      shopKartOrderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.description || error.message || "Failed to create Razorpay order.",
      error: error.error?.description || error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are incomplete.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ShopKart order ID.",
      });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized.",
      });
    }

    // Verify HMAC SHA256 Signature using trusted DB order.razorpayOrderId and secret as per Lab-06 Step 12
    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();

      // Cart MUST NOT be cleared on payment failure
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Signature verified successfully -> Mark PAID and PLACED as per Lab-06 Step 13
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for ordered items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user cart in DB ONLY after verified payment
    const user = await Customer.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order confirmed!",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification.",
      error: error.message,
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders.",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Ownership check: user can only view their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to view this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching single order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching order details.",
      error: error.message,
    });
  }
};
