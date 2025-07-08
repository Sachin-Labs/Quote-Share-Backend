import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";


export const authenticate = async (req, res, next) => {
    const { token } = req.cookies;
    console.log('token',token)
  try {
    if (!token) {
      return res.status(401).send("User not authorized");
    }
    const isAuthorised = jwt.verify(token, process.env.JWT_SECRET);    
    const { id } = isAuthorised;
    const user = await UserModel.findById(id);    
    console.log('user',user)
    if (!user) {
      return res.status(401).send("User not authenticated");
    } else {
      req.user = user;
      next();
    }
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
