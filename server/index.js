import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import custRouter from './routes/customer.routes.js'
import cors from 'cors'
import prodRouter from './routes/product.routes.js'
import wishlistRouter from './routes/wishlist.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express()
const port = 4004
const dburl = process.env.connection
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}))
app.use(cookieParser())

mongoose.connect(dburl).then(() => console.log("DB Connected")).catch((err) => console.log(err))
app.use(['/customers', '/customer'], custRouter);
app.use('/products', prodRouter);
app.use('/wishlist', wishlistRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

app.listen(port, () => console.log(`Server started at ${port}`));
