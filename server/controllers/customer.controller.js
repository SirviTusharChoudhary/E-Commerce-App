import Customer from "../models/customer.model.js"
import { genToken } from "../utils/generateToken.js";
import bcrypt from 'bcrypt';

const cookieOptions = {
    httpOnly: true
}

export const customerRegister = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !phone || !email || !password) {
            return res.status(400).json({ success: false, message: "All Fields are required" });
        }

        const phoneExists = await Customer.findOne({ phone });
        if (phoneExists) {
            return res.status(409).json({ success: false, message: "Phone Number already Exists" });
        }

        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ success: false, message: "Email already Exists" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "password length must be atleast 6" });
        }

        const salt = await bcrypt.genSalt(12);
        const hashPass = await bcrypt.hash(password, salt);

        const customer = await Customer.create({ fullName, email, password: hashPass, phone });
        const token = genToken(customer._id);
        res.cookie("token", token, cookieOptions);

        const safeCustomer = customer.toObject();
        delete safeCustomer.password;

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: safeCustomer,
            userData: safeCustomer
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message || err });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All Fields are necessary" });
        }

        const emailExists = await Customer.findOne({ email });
        if (!emailExists) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password length must be atleast 6" });
        }

        const passCheck = await bcrypt.compare(password, emailExists.password);
        if (!passCheck) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = genToken(emailExists._id);
        res.cookie("token", token, cookieOptions);

        const safeCustomer = emailExists.toObject();
        delete safeCustomer.password;

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            userData: safeCustomer,
            customer: safeCustomer
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message || err });
    }
};

export const getCustomer = async (req, res) => {
    try {
        const safeCustomer = req.user.toObject ? req.user.toObject() : { ...req.user };
        delete safeCustomer.password;
        return res.status(200).json({
            success: true,
            message: "Customer Authenticated",
            customerData: safeCustomer,
            customer: safeCustomer,
            user: safeCustomer
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message || err });
    }
};

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successful"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



