import Chat from "../models/Chat.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChat = async (req, res) => {
  const { userId } = req;
  const { otherUserId } = req.params;
  let chat = await Chat.findOne({ users: { $all: [userId, otherUserId] } });
  if (!chat) {
    chat = await Chat.create({ users: [userId, otherUserId], messages: [] });
  }
  res.json(chat);
};

export const sendMessage = async (req, res) => {
  const { userId } = req;
  const { otherUserId } = req.params;
  const { content } = req.body;
  let chat = await Chat.findOne({ users: { $all: [userId, otherUserId] } });
  if (!chat) {
    chat = await Chat.create({ users: [userId, otherUserId], messages: [] });
  }
  chat.messages.push({ sender: userId, content });
  await chat.save();
  res.json(chat);
}; 