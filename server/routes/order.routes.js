import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

// Order creation & payment
router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/", isAuthenticated, createPaymentOrder); // Also supports POST /orders
router.post("/verify-payment", isAuthenticated, verifyPayment);

// Order querying
router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);

export default router;
