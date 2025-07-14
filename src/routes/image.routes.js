import express from "express";
import { upload } from "../utils/cloudinary.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { getImages, uploadImage } from "../controllers/image.controller.js";

const router = express.Router();

router.post("/image/upload", authenticate, upload.single("image"), uploadImage);
router.get("/images", authenticate, getImages);

export default router;
