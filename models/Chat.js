import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat; 