import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Quote = mongoose.model("Quote", quoteSchema);
export default Quote;
