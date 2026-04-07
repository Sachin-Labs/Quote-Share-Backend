import Quote from "../models/Quote.js";
import { v2 as cloudinary } from "cloudinary";

// own routes

export const getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ createdBy: req.user }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      message: "Quotes fetched successfully",
      data: quotes.map((quote) => ({
        id: quote._id,
        quote: quote.quote,
        author: quote.author,
        caption: quote.caption,
        imageUrl: quote.imageUrl,
        socialLinks: quote.socialLinks,
        status: quote.status,
        adminComment: quote.adminComment,
        createdAt: quote.createdAt,
        createdBy: req.user.emailId,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    if (quote.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this quote" });
    }
    res.status(200).json({
      message: "Quote fetched successfully",
      data: {
        id: quote._id,
        quote: quote.quote,
        id: quote._id,
        quote: quote.quote,
        author: quote.author,
        socialLinks: quote.socialLinks,
        caption: quote.caption,
        imageUrl: quote.imageUrl,
        status: quote.status,
        createdAt: quote.createdAt,
        createdBy: req.user.emailId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postQuote = async (req, res) => {
  try {
    const { quote, author, caption, imageUrl, socialLinks } = req.body;

    if (!quote || !author || !caption || !imageUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedLinks =
      typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;

    const hasAtLeastOneLink = Object.values(parsedLinks).some(
      (link) => link && link.trim() !== ""
    );

    if (!hasAtLeastOneLink) {
      return res
        .status(400)
        .json({ message: "At least one social link is required" });
    }

    if (quote.length > 500 || author.length > 20 || caption.length > 40) {
      return res.status(400).json({ message: "Field lengths exceed limits" });
    }

    const newQuote = await Quote.create({
      quote,
      author,
      caption,
      imageUrl,
      status: "pending",
      createdBy: req.user,
      socialLinks: {
        facebook: parsedLinks.facebook || "",
        instagram: parsedLinks.instagram || "",
        twitter: parsedLinks.twitter || "",
        linkedin: parsedLinks.linkedin || "",
        website: parsedLinks.website || "",
      },
    });

    res.status(201).json({
      message: "Quote created successfully",
      data: {
        ...newQuote.toObject(),
        createdBy: newQuote.createdBy.emailId,
      },
    });
  } catch (err) {
    console.error("Post quote error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editQuote = async (req, res) => {
  try {
    const { quote, author, caption, imageUrl, socialLinks } = req.body;
    const parsedLinks =
      typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;

    const existingQuote = await Quote.findById(req.params.id);
    if (!existingQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (existingQuote.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this quote" });
    }

    if (existingQuote.status === "approved") {
      return res.status(400).json({ message: "Cannot edit an approved quote" });
    }

    if (!quote && !author && !caption && !imageUrl && !socialLinks) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const hasAtLeastOneLink =
      parsedLinks &&
      typeof parsedLinks === "object" &&
      Object.values(parsedLinks).some(
        (link) => link && link.trim() !== ""
      );

    if (!hasAtLeastOneLink) {
      return res
        .status(400)
        .json({ message: "At least one social link is required" });
    }

    if (parsedLinks && typeof parsedLinks === "object") {
      existingQuote.socialLinks = {
        facebook: parsedLinks.facebook || "",
        instagram: parsedLinks.instagram || "",
        twitter: parsedLinks.twitter || "",
        linkedin: parsedLinks.linkedin || "",
        website: parsedLinks.website || "",
      };
    }

    existingQuote.quote = quote || existingQuote.quote;
    existingQuote.author = author || existingQuote.author;
    existingQuote.caption = caption || existingQuote.caption;

    if (imageUrl) {
      existingQuote.imageUrl = imageUrl;
    }

    existingQuote.status = "pending";
    existingQuote.isVerified = false;
    existingQuote.adminComment = "";

    const updatedQuote = await existingQuote.save();

    res.status(200).json({
      message: "Quote updated successfully",
      data: updatedQuote,
    });
  } catch (err) {
    console.error("Edit quote error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const quoteId = req.params.id;
    const emailId = req.user.emailId;

    const existingQuote = await Quote.findById(quoteId);
    if (!existingQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (existingQuote.createdBy !== emailId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this quote" });
    }

    await Quote.findByIdAndDelete(quoteId);

    res.status(200).json({ message: "Quote deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// admin routes
export const approveQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || comment.length > 300) {
      return res.status(400).json({
        message: "Comment is required and must be less than 300 characters",
      });
    }
    const quote = await Quote.findByIdAndUpdate(
      id,
      { status: "approved", adminComment: comment },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.json({ message: "Quote approved", quote });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || comment.length > 300) {
      return res.status(400).json({
        message: "Comment is required and must be less than 300 characters",
      });
    }
    const quote = await Quote.findByIdAndUpdate(
      id,
      { status: "rejected", adminComment: comment },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.json({ message: "Quote rejected", quote });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllQuotes = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const quotes = await Quote.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Quotes fetched successfully",
      data: quotes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getQuoteStats = async (req, res) => {
  try {
    let matchCondition = {};

    // If user is not admin, filter by their email
    if (req.user.role !== "admin") {
      matchCondition.createdBy = req.user._id;
    }

    const stats = await Quote.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const response = {
      approved: 0,
      pending: 0,
      rejected: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      if (["approved", "pending", "rejected"].includes(stat._id)) {
        response[stat._id] = stat.count;
        response.total += stat.count;
      }
    });

    res.status(200).json({
      message: "Quote stats fetched successfully",
      data: response,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// public routes
export const getQuote = async (req, res) => {
  try {
    const quotes = await Quote.aggregate([
      { $match: { status: "approved" } },
      { $sample: { size: 1 } },
    ]);

    res.status(200).json({
      message: "Random approved quote fetched successfully",
      data: quotes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
