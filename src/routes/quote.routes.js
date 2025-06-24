import express from "express";
import { upload } from "../utils/cloudinary.js";
import { postQuote } from "../controllers/quote.controller.js";

const router = express.Router();

router.post("/quote/", upload.single("image"), postQuote);

export default router;
