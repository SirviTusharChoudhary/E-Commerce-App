import express from 'express'
import { customerRegister, getCustomer, loginCustomer, logoutCustomer } from '../controllers/customer.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const custRouter = express.Router();

custRouter.post('/register', customerRegister)
custRouter.post('/login', loginCustomer)
custRouter.get("/me", isAuthenticated, getCustomer)
custRouter.post('/logout', logoutCustomer)

export default custRouter;