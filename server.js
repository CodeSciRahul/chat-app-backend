import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./src/config/dbConfig.js";
import properties from "./src/config/properties.js";
import { protectRoute } from "./src/api/middlewares/protectedRoute.js";
import { Server } from "socket.io";
import http from "http";
import { upload } from "./src/api/middlewares/handleFile.js";
import Message from "./src/api/model/message.js";
import Conversation from "./src/api/model/receiver.js";

//different route
import { authRoute } from "./src/api/route/auth.js";
import { messageRouter } from "./src/api/route/message.js";
import { receiverRouter } from "./src/api/route/receiver.js";

dotenv.config();

//connect DB
connectDB(properties.MONGO_URL).catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
  pingInterval: 25000, // 25 seconds
  pingTimeout: 10000, // 10 seconds
  maxHttpBufferSize: 1e8, // Increase the max buffer size for large files (100MB)
});

// Updated CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:5173"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Preflight requests handler
app.options("*", cors(corsOptions)); // Handles preflight for all routes
app.use(bodyParser.json());

const port = Number(properties.PORT) || 5000;

app.get("/", async (req, res) => {
  return res.send(`<h1>Running backend on Port : ${port}</h1>`);
});

io.on("connection", (socket) => {
  // Join private room for two users
  socket.on("join_room", ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join("_"); // Unique room name
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle sending messages
  socket.on("send_message", async ({ senderId, receiverId, content }) => {
    const room = [senderId, receiverId].sort().join("_");

    // Save the message to the database
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    await newMessage.save();

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      userId: senderId,
      participants: receiverId,
    });
    if (!conversation) {
      conversation = new Conversation({
        userId: senderId,
        participants: [receiverId],
      });
      await conversation.save();
    }

    // Emit the message to the room
    io.to(room).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//route
app.use("/api", authRoute);
app.use("/api", protectRoute, messageRouter);
app.use("/api", receiverRouter);

// Use server.listen for both HTTP and WebSocket on the same port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open Browser: http://localhost:${port}`);
});
