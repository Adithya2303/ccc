import User from "../models/User.js";

export const getSkills = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({
    skills: user.skills,
    wantsToLearn: user.wantsToLearn,
    username: user.username,
    email: user.email
  });
};

export const updateSkills = async (req, res) => {
  const { skills, wantsToLearn } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { skills, wantsToLearn },
    { new: true }
  );
  res.json({
    skills: user.skills,
    wantsToLearn: user.wantsToLearn,
    username: user.username,
    email: user.email
  });
}; 