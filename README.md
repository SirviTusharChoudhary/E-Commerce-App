# 🛒 bazr. — Full-Stack MERN E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode-02042B?logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

A modern, production-ready, full-stack E-Commerce web application built using the **MERN** stack (MongoDB, Express.js, React, Node.js). Features end-to-end shopping journeys including authentication, product catalog, wishlist, persistent cart, address validation, Razorpay test payments with cryptographic HMAC SHA256 signature verification, historical order snapshots, and visual order lifecycle tracking.

---

## 🌟 Key Features

### 🔐 Authentication & User Profiles
- **JWT Authentication** with HTTP-only cookies and Bearer tokens.
- Secure password hashing using **bcrypt**.
- Protected API routes and route guards (`ProtectedRoute` / `PublicRoute`).

### 🛍️ Product Catalog & Wishlist
- Browse products with responsive grid layouts, category filters, and detailed product views.
- Media management powered by **Cloudinary**.
- Persistent user wishlist synced directly to MongoDB.

### 🛒 Shopping Cart & Server-Side Validation
- Dynamic cart with real-time quantity adjustments, unit subtotals, and live navbar badges.
- **Strict Server Revalidation**: Stock availability and prices are re-checked directly against the database on checkout.
- Cart state immediately clears on verified payment while remaining intact if payment fails or is cancelled.

### 💳 Razorpay Payment Gateway & Checkout
- Multi-step checkout with client & server-side shipping address validation (6-digit pincode, phone formatting).
- **Backend-Driven Pricing**: Order totals and Razorpay orders (in paise) are computed strictly on the backend to prevent frontend price manipulation.
- **HMAC SHA256 Signature Verification**: Cryptographically verifies payment integrity using Node's native `crypto` module before marking orders as `PAID`.
- In-app sandbox simulation fallback for environments without active live keys.

### 📦 Order Management & Purchase Snapshots
- **Historical Snapshots**: Product name, price snapshot, image, and quantity are preserved at purchase time, making past orders immune to future catalogue changes.
- **My Orders Page**: View purchase history, payment status badges (`PAID`, `PENDING`, `FAILED`), and timestamps.
- **Visual Status Stepper**: Interactive tracking progression (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).

### 🎨 Design & Aesthetics
- Minimalist modern UI with dark mode / light mode toggle (`Plus Jakarta Sans` typography).
- Responsive layouts built with **Tailwind CSS**.
- Micro-animations, skeleton loaders, and feedback toasts using **Lucide Icons**.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Tailwind CSS v4, Lucide React, Axios |
| **Backend** | Node.js, Express.js 5, JSON Web Tokens (JWT), Cookie-Parser, Multer |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Payments** | Razorpay SDK, Node Crypto (HMAC SHA256) |
| **Media Storage** | Cloudinary |

---

## 📐 Project Structure

```text
E-Commerce-MERN/
├── client/                     # Frontend React (Vite) Application
│   ├── src/
│   │   ├── axiosCalls/         # Axios instance and API configurations
│   │   ├── components/         # Reusable UI (Navbar, ProductCard, CartItem, ThemeToggle, etc.)
│   │   ├── context/            # React Contexts (AuthContext, CartContext, ThemeContext)
│   │   ├── pages/              # Views (Home, Products, Cart, Checkout, Orders, OrderDetails, etc.)
│   │   ├── App.jsx             # Main routing table
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/                     # Backend Node.js / Express REST API
│   ├── config/                 # Razorpay client & Cloudinary config
│   ├── controllers/            # Route controllers (auth, cart, order, product, wishlist)
│   ├── middlewares/            # JWT authentication middleware
│   ├── models/                 # Mongoose schemas (Customer, Product, Order)
│   ├── routes/                 # REST API endpoints
│   ├── index.js                # Express server entry point
│   └── .env                    # Environment variables (git-ignored)
└── README.md
```

---

## 🔌 API Endpoints Summary

### Customer & Auth (`/customer`)
- `POST /customer/signup` — Register a new account
- `POST /customer/login` — Authenticate and receive JWT
- `POST /customer/logout` — Clear auth cookie
- `GET /customer/profile` — Get current authenticated user

### Products (`/products`)
- `GET /products` — Get list of products
- `GET /products/:id` — Get single product details
- `POST /products` — Create a product (with image upload)

### Cart (`/cart`)
- `GET /cart` — Fetch user's persistent cart
- `POST /cart/:productId` — Add item to cart / increment
- `PATCH /cart/:productId` — Update item quantity
- `DELETE /cart/:productId` — Remove item from cart

### Orders & Payments (`/orders`)
- `POST /orders/create-payment-order` — Re-verify stock, create pending order and Razorpay order
- `POST /orders/verify-payment` — Verify HMAC SHA256 signature, mark PAID, deduct stock, clear cart
- `GET /orders` — Get current user's past orders (newest first)
- `GET /orders/:id` — Get single order details with ownership authorization
- `PATCH /orders/:id/status` — Update order progression status (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance
- [Razorpay](https://dashboard.razorpay.com/) Test Account (optional for live test popups)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Configure Backend Environment
Navigate to `server/` and create or configure `.env`:
```env
PORT=4004
connection=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
jwt_secret=your_jwt_secret_key
cloud_name=your_cloudinary_name
cloud_api_key=your_cloudinary_api_key
cloud_api_secret=your_cloudinary_api_secret

# Razorpay Test Mode Keys (Use placeholders for built-in sandbox or enter real test keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Install Dependencies & Run Server
```bash
cd server
npm install
npm run dev
```
*Server starts at `http://localhost:4004`.*

### 4. Install Dependencies & Run Frontend
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🛡️ Security & Business Logic Highlights

- **Server-Side Pricing**: Frontend cart totals are strictly ignored during checkout; prices are calculated from current database records.
- **Stock Guard**: Checks product stock before order creation to prevent overselling.
- **Safe Cart Reset**: User cart is cleared only upon verified cryptographic signature verification.
- **Data Encapsulation**: Orders capture an immutable snapshot of prices and details at purchase time.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
