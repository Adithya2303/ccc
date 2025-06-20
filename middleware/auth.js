import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

export default function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  try {
    const { userId } = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
} 