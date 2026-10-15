import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/products.model.js";


export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Ensure cart array is initialized
    if (!req.user.cart) {
      req.user.cart = [];
    }

    const existingItemIndex = req.user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex === -1) {
      // Product not in cart: check initial stock
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      req.user.cart.push({
        product: productId,
        quantity: 1,
      });
    } else {
      // Product already in cart: increment by 1 and validate against stock
      const newQuantity = req.user.cart[existingItemIndex].quantity + 1;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Available stock is ${product.stock}`,
        });
      }

      req.user.cart[existingItemIndex].quantity = newQuantity;
    }

    await req.user.save();

    // Populate product details for consistent frontend state
    await req.user.populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    const validCart = (req.user.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding to cart",
      error: err.message,
    });
  }
};


export const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out items whose referenced products no longer exist
    const validCart = (user.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching cart",
      error: err.message,
    });
  }
};


export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity is a valid integer
    const numQuantity = Number(quantity);
    if (quantity === undefined || isNaN(numQuantity) || !Number.isInteger(numQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid integer",
      });
    }

    if (numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify product is already in user's cart
    if (!req.user.cart || req.user.cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const itemIndex = req.user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Validate requested quantity against product stock
    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock} available)`,
      });
    }

    req.user.cart[itemIndex].quantity = numQuantity;
    await req.user.save();

    await req.user.populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    const validCart = (req.user.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: validCart,
    });
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating cart quantity",
      error: err.message,
    });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.user.cart || req.user.cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const exists = req.user.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    req.user.cart = req.user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await req.user.save();

    await req.user.populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    const validCart = (req.user.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart,
    });
  } catch (err) {
    console.error("Error removing product from cart:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing from cart",
      error: err.message,
    });
  }
};
