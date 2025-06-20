import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/chats", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/match", matchRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ userId, otherUserId }) => {
      const room = [userId, otherUserId].sort().join("-");
      socket.join(room);
    });
    socket.on("send_message", ({ userId, otherUserId, content }) => {
      const room = [userId, otherUserId].sort().join("-");
      io.to(room).emit("receive_message", { userId, content, timestamp: new Date() });
    });
  });
}).catch(err => console.error("MongoDB connection error:", err)); 