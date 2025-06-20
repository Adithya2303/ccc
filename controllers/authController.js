import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

export const register = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "User with this email exists" });
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hashed });
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkAuth = (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  try {
    const { userId } = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    res.status(200).json({ valid: true, userId });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}; 