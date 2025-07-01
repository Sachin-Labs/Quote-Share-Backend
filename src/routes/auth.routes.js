import express from 'express';
import { requestOtp,verifyOtp,register,login,logout } from '../controllers/auth.controller.js';
 

const Router = express.Router();

Router.post('/requestOtp/', requestOtp);
Router.post('/verifyOtp/', verifyOtp);
Router.post('/register/', register);
Router.post('/login/', login);
Router.get('/logout/', logout);


export default Router;