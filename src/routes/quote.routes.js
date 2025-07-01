import express from "express";
import { upload } from "../utils/cloudinary.js";
import { postQuote,getQuote,approveQuote,rejectQuote,editQuote,getMyQuotes,getAllQuotes,deleteQuote,getQuoteStats } from "../controllers/quote.controller.js";
import { authenticate,isAdmin } from "../middlewares/authenticate.middleware.js";

const router = express.Router();

// own routes
router.post("/quote/", authenticate, upload.single("image"), postQuote);
router.put('/quote/:id',authenticate,upload.single("image"), editQuote)
router.get('/myQuote',authenticate, getMyQuotes)
router.delete("/quotes/:id", authenticate, deleteQuote);
router.get("/quote-stats", authenticate, getQuoteStats);

//admin routes
router.get("/quotes", authenticate, isAdmin, getAllQuotes);
router.put('approve/quote/:id', authenticate, isAdmin, approveQuote); 
router.put('reject/quote/:id', authenticate, isAdmin, rejectQuote); 

// public routes
router.get("/quote/", getQuote);

export default router;
