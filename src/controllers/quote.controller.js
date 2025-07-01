import Quote from "../models/Quote.js";

// own routes

export const getMyQuotes = async (req, res) => {
  try {
    const emailId = req.user.emailId;

    const quotes = await Quote.find({ createdBy: emailId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Quotes fetched successfully",
      data: quotes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postQuote = async (req, res) => {
  try {
    const { quote, author, caption, createdBy } = req.body;
    console.log(req.body);
    if (!quote || !author || !caption || !req.file || !createdBy) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (
      quote.length > 500 ||
      author.length > 20 ||
      caption.length > 40 ||
      createdBy.length > 40
    ) {
      return res.status(400).json({ message: "Field lengths exceed limits" });
    }
    const newQuote = await Quote.create({
      quote,
      author,
      caption,
      imageUrl: req.file.path,
      status: "pending",
      createdBy,
    });
    res.status(201).json({
      message: "Quote created successfully",
      data: newQuote,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editQuote = async (req, res) => {
  try {
    const { quote, author, caption } = req.body;
    const existingQuote = await Quote.findById(req.params.id);
    if (!existingQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    if (existingQuote.createdBy !== req.user.emailId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this quote" });
    }
    if (existingQuote.status === "approved") {
      return res.status(400).json({ message: "Cannot edit an approved quote" });
    }

    if (!quote && !author && !caption && !req.file) {
      return res.status(400).json({ message: "No update data provided" });
    }

    existingQuote.quote = quote || existingQuote.quote;
    existingQuote.author = author || existingQuote.author;
    existingQuote.caption = caption || existingQuote.caption;

    existingQuote.status = "pending";
    existingQuote.isVerified = false;
    existingQuote.adminComment = "";

    if (req.file) {
      existingQuote.imageUrl = req.file.path;
    }
    const updatedQuote = await existingQuote.save();
    res
      .status(200)
      .json({ message: "Quote updated successfully", data: updatedQuote });
  } catch (err) {
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
    const quote = await Quote.findByIdAndUpdate(
      id,
      { status: "approved" },
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
      matchCondition.createdBy = req.user.emailId;
    }

    const stats = await Quote.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const response = {
      approved: 0,
      pending: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      response[stat._id] = stat.count;
    });

    res.status(200).json({
      message: "Quote stats fetched successfully",
      data: response
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
