import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
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
    const dbOtp = await Otp.findOne({ emailId });
    if (dbOtp) {
      if (dbOtp.count >= 5) {
        return res
          .status(400)
          .json({ message: "OTP request limit exceeded. Try again later." });
      }
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
      dbOtp.count = (dbOtp.count || 0) + 1;
      dbOtp.otp = newOtp;
      await sendOtp({ emailId, otp: newOtp });
      await dbOtp.save();
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
      const otp = await Otp.create({
        emailId,
        otp: newOtp,
        count: 1,
        expires: expiryTime,
        verified: false,
      });
      await sendOtp({ emailId, otp: newOtp });
      await otp.save();
      res.status(201).json({ message: "OTP sent successfully" });
    }
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    validateOTP(req);
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
    if (dbOtp.expires < Date.now()) {
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

export const register = async (req, res) => {
  try {
    const { emailId, name, password } = req.body;
    validateSignup(req);
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
    console.log(isProd)
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

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
