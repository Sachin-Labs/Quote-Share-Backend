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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    socialLinks: {
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    adminComment: { type: String, maxlength: 300, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Quote = mongoose.model("Quote", quoteSchema);
export default Quote;
