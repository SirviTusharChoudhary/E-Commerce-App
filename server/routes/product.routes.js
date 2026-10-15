import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/uploadImageMiddleware.js';
import { createProduct, getAllProducts, getProductById } from '../controllers/product.controller.js';

const prodRouter = express.Router();

prodRouter.post('/', upload.single('image'), createProduct);
prodRouter.post('/createProducts', upload.single('image'), createProduct);
prodRouter.get('/', getAllProducts);
prodRouter.get('/allProducts', getAllProducts);
prodRouter.get('/:id', getProductById);
prodRouter.get('/product/:id', getProductById);

export default prodRouter;