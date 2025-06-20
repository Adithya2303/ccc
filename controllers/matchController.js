import User from "../models/User.js";

export const findMatches = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const matches = await User.find({
    _id: { $ne: user._id },
    skills: { $in: user.wantsToLearn },
    wantsToLearn: { $in: user.skills }
  }, "email skills wantsToLearn");

  res.json({ matches });
}; 