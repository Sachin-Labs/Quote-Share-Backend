import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  isValidGmail,
  validateOTP,
  validateSignIn,
  validateSignup,
} from "../utils/validators.js";
import { sendOtp } from "../utils/sendOtp.js";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

const isProd = process.env.NODE_ENV === "production";

export const requestOtp = async (req, res) => {
  try {
    const { emailId } = req.body;
    validateOTP(req);
    if (!isValidGmail(emailId)) {
      return res
        .status(400)
        .json({ message: "Only Gmail addresses are allowed." });
    }
    const dbOtp = await Otp.findOne({ emailId });
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

    if (dbOtp) {
      if (dbOtp.count >= 5) {
        return res
          .status(400)
          .json({ message: "OTP request limit exceeded. Try again later." });
      }
      dbOtp.count = (dbOtp.count || 0) + 1;
      dbOtp.otp = newOtp;
      dbOtp.expires = expiryTime;
      dbOtp.verified = false;
      await sendOtp({ emailId, otp: newOtp });
      await dbOtp.save();
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      await Otp.create({
        emailId,
        otp: newOtp,
        count: 1,
        expires: expiryTime,
        verified: false,
      });
      await sendOtp({ emailId, otp: newOtp });
      res.status(201).json({ message: "OTP sent successfully" });
    }
  } catch (e) {
    console.error("requestOtp Error:", e);
    if (e.message.includes("Required") || e.message.includes("valid EmailId")) {
      return res.status(400).json({ message: e.message });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    validateOTP(req);
    if (!isValidGmail(emailId)) {
      return res
        .status(400)
        .json({ message: "Only Gmail addresses are allowed." });
    }
    const dbUser = await User.findOne({ emailId });
    if (dbUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const dbOtp = await Otp.findOne({ emailId });
    if (!dbOtp) {
      return res.status(404).json({ message: "OTP not found for this email" });
    }
    if (dbOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date(dbOtp.expires).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (dbOtp.verified === true) {
      return res.status(400).json({ message: "OTP already verified" });
    }
    if (dbOtp.otp === otp) {
      dbOtp.verified = true;
      await dbOtp.save();
      res.status(200).send({ message: "Otp Verified Successfully" });
    }
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requestForgotOtp = async (req, res) => {
  try {
    const { emailId } = req.body;
    validateOTP(req);
    if (!isValidGmail(emailId)) {
      return res
        .status(400)
        .json({ message: "Only Gmail addresses are allowed." });
    }

    const userExists = await User.findOne({ emailId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingOtp = await Otp.findOne({ emailId });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

    if (existingOtp) {
      if (existingOtp.count >= 5) {
        return res
          .status(400)
          .json({ message: "OTP request limit exceeded. Try again later." });
      }
      existingOtp.count += 1;
      existingOtp.otp = newOtp;
      existingOtp.expires = expiryTime;
      existingOtp.verified = false;
      await sendOtp({ emailId, otp: newOtp });
      await existingOtp.save();
      return res.status(200).json({ message: "OTP sent successfully" });
    }

    await Otp.create({
      emailId,
      otp: newOtp,
      expires: expiryTime,
      count: 1,
      verified: false,
    });
    await sendOtp({ emailId, otp: newOtp });
    return res.status(201).json({ message: "OTP sent successfully" });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyForgotOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    validateOTP(req);

    const dbUser = await User.findOne({ emailId });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const dbOtp = await Otp.findOne({ emailId });
    if (!dbOtp || dbOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(dbOtp.expires).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    dbOtp.verified = true;
    await dbOtp.save();
    res.status(200).send({ message: "OTP verified for password reset" });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const register = async (req, res) => {
  try {
    const { emailId, name, password } = req.body;
    validateSignup(req);
    if (!isValidGmail(emailId)) {
      return res
        .status(400)
        .json({ message: "Only Gmail addresses are allowed." });
    }
    const otpUser = await Otp.findOne({ emailId });
    if (!otpUser || !otpUser.verified) {
      return res
        .status(400)
        .json({ message: "Session Expired. Please verify email" });
    }
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      emailId,
      name,
      password: hashedPassword,
      role: "user",
    });
    await Otp.deleteOne({ emailId });
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    validateSignIn(req);
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Details Mismatch" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
      })
      .json({ message: "Login successful" });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;

    // Check email validity
    if (!isValidGmail(emailId)) {
      return res
        .status(400)
        .json({ message: "Only Gmail addresses are allowed." });
    }

    // Check if OTP was verified
    const otpUser = await Otp.findOne({ emailId });
    if (!otpUser || !otpUser.verified) {
      return res
        .status(400)
        .json({ message: "Please verify OTP before resetting password" });
    }

    // Check if user exists
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Invalidate OTP
    await Otp.deleteOne({ emailId });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
