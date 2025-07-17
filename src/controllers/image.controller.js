import Image from "../models/Image.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "User ID and image file are required." });
    }

    // console.log(req.user.role)
    if (req.user.role !== "admin") {
      const imageCount = await Image.countDocuments({ userId: req.user._id });
      if (imageCount >= 20) {
        return res.status(403).json({
          message: "Image upload limit reached. Only 20 images allowed.",
        });
      }
    }

    const newImage = new Image({
      userId: req.user,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });

    await newImage.save();
    res.status(201).json({
      message: "Image Uploaded Successfully",
      imageUrl: newImage.imageUrl,
    });
  } catch (e) {
    // console.log(e.message);
    res.status(500).json({ message: "Image upload failed" });
  }
};

export const getImages = async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ message: "Images fetched successfully", data: images });
  } catch (e) {
    console.error("Fetch images error", e);
    res.status(500).json({ message: "Failed to fetch user images" });
  }
};
