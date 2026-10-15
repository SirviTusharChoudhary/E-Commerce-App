import Customer from "../models/customer.model.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers?.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            }
        }
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
    
        let verification;
        try {
            verification = jwt.verify(token, process.env.jwt_secret);
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
        }

        const user = await Customer.findById(verification.custId);
    
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found, token invalid" });
        }
    
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};