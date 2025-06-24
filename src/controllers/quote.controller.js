import Quote from "../models/Quote.js";

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
      isVerified: false,
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
