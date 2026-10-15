import mongoose from "mongoose";
import Product from "../models/products.model.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;

        if (!name || !description || price === undefined || !category || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, stock) are required"
            });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);

        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            });
        }

        let imageUrl = typeof image === "string" ? image.trim() : "";

        if (req.file) {
            const uploadedImage = await uploadCloudinary(req.file.buffer);
            imageUrl = uploadedImage.secure_url;
        }

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Product image is required (either file upload or image URL)"
            });
        }

        const newProduct = await Product.create({
            name: String(name).trim(),
            description: String(description).trim(),
            price: numPrice,
            category: String(category).trim(),
            stock: numStock,
            image: imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message || err
        });
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const filter = {};

        if (search && search.trim()) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        if (category && category !== "All Categories" && category !== "All" && category.trim() !== "") {
            filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
        }

        let sortCriteria = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        if (sort === "price_asc") {
            sortCriteria = { price: 1 };
        } else if (sort === "price_desc") {
            sortCriteria = { price: -1 };
        }

        const products = await Product.find(filter)
            .sort(sortCriteria)
            .lean();

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};