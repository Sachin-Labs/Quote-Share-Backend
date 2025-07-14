import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import quoteRouter from "./src/routes/quote.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import imageRouter from "./src/routes/image.routes.js";

dotenv.config();
const allowedOrigins = process.env.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim()
);

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed for this origin" + origin));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/", quoteRouter);
app.use("/api/v1/", authRouter);
app.use("/api/v1/", imageRouter);

app.use((err, req, res, next) => {
  console.error("Multer/Cloudinary Upload Error:", err);
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  return res
    .status(500)
    .json({ message: "File upload failed", error: err.message });
});

const PORT = process.env.PORT || 3000;

const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DataBase");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDBAndStartServer();
