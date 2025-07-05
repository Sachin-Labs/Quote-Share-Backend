import express from 'express';
import { requestOtp,verifyOtp,register,login,logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
 

const Router = express.Router();

Router.post('/requestOtp/', requestOtp);
Router.post('/verifyOtp/', verifyOtp);
Router.post('/register/', register);
Router.post('/login/', login);
Router.get('/logout/', logout);

Router.get('/verify', authenticate, (req,res)=>{
    res.status(200).json({ message: "User is authenticated", user: {name: req.user.name, emailId: req.user.emailId} });
})


export default Router;