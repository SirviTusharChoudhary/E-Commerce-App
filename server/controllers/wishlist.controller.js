import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/products.model.js";


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check for duplicate wishlist entry
    const isAlreadyWishlisted = req.user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add Product ObjectId reference and persist
    req.user.wishlist.push(productId);
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding to wishlist",
      error: err.message,
    });
  }
};


export const getWishlist = async (req, res) => {
  try {
    // Populate product references directly from Customer model
    const user = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out nulls in case referenced product was deleted
    const validProducts = (user.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: validProducts.length,
      wishlist: validProducts,
    });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wishlist",
      error: err.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.user.wishlist || req.user.wishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Check if product is currently in wishlist
    const exists = req.user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove reference and persist
    req.user.wishlist = req.user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing from wishlist",
      error: err.message,
    });
  }
};
