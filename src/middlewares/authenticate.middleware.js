export const authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("User not authorised");
    }
    const isAuthorised = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = isAuthorised;
    const user = await UserModel.findById(_id);
    if (!user) {
      return res.status(401).send("User not authorised");
    } else {
      req.user = user;
      next();
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
