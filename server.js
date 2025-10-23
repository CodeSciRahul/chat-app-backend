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
import { 
  createMessage, 
  findMessageByIdWithPopulate, 
  addReactionToMessage,
  removeReactionFromMessage
} from "./src/database/operations/message.operation.js";
import { 
  createConversation, 
  findConversationByUserIdAndParticipant 
} from "./src/database/operations/conversation.operation.js";

//different route
import { authRoute } from "./src/api/route/auth.js";
import { messageRouter } from "./src/api/route/message.js";
import { receiverRouter } from "./src/api/route/receiver.js";
import { groupRouter } from "./src/api/route/group.js";
import { groupMessageRouter } from "./src/api/route/groupMessage.js";

dotenv.config();

//connect DB
connectDB(properties.MONGO_URL).catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { 
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  pingInterval: 25000, // 25 seconds
  pingTimeout: 10000, // 10 seconds
  maxHttpBufferSize: 1e8, // Increase the max buffer size for large files (100MB)
});


// Updated CORS configuration
const corsOptions = {
  origin: "*", // Allow all origins
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

  // Join group room
  socket.on("join_group", ({ groupId, userId }) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${userId} joined group: ${groupId}`);
  });

  // Leave group room
  socket.on("leave_group", ({ groupId, userId }) => {
    socket.leave(`group_${groupId}`);
    console.log(`User ${userId} left group: ${groupId}`);
  });

  // Handle sending private messages
  socket.on("send_message", async ({ senderId, receiverId, content, fileUrl, fileType, replyTo }) => {
    try {
      const room = [senderId, receiverId].sort().join("_");

      // Save the message to the database using database operations
      const messageData = {
        sender: senderId,
        receiver: receiverId,
        content,
        fileUrl,
        fileType,
        messageType: "private",
        replyTo
      };
      
      const newMessage = await createMessage(messageData);

      // Populate sender and receiver details
      const populatedMessage = await findMessageByIdWithPopulate(newMessage._id);

      // Check if a conversation already exists using database operations
      let conversation = await findConversationByUserIdAndParticipant(senderId, receiverId);
      if (!conversation) {
        conversation = await createConversation({ 
          userId: senderId, 
          participants: [receiverId] 
        });
      }

      // Emit the message to the room
      io.to(room).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("Error sending private message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle sending group messages
  socket.on("send_group_message", async ({ senderId, groupId, content, fileUrl, fileType, replyTo }) => {
    try {
      // Save the message to the database using database operations
      const messageData = {
        sender: senderId,
        groupId: groupId,
        content,
        fileUrl,
        fileType,
        messageType: "group",
        replyTo
      };
      
      const newMessage = await createMessage(messageData);

      // Populate message details
      const populatedMessage = await findMessageByIdWithPopulate(newMessage._id);

      // Emit the message to the group room
      io.to(`group_${groupId}`).emit("receive_group_message", populatedMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle message reactions
  socket.on("add_reaction", async ({ messageId, userId, emoji, groupId = null}) => {
    try {
      // Use database operations for adding reaction
      const message = await addReactionToMessage(messageId, userId, emoji);
      console.log("message", message);

      if (groupId) {
        io.to(`group_${groupId}`).emit("message_reaction_added", message);
      } else {
        // For private messages, emit to both users
        const room = [message.sender._id, message.receiver].sort().join("_");
        io.to(room).emit("message_reaction_added", message);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      socket.emit("error", { message: "Failed to add reaction" });
    }
  });

  socket.on("remove_reaction", async ({ messageId, reactionId}) => {
    try {
      const message = await removeReactionFromMessage(messageId, reactionId);
      console.log("remove reaction message", message);
      if (message.messageType === "group") {
        io.to(`group_${message.groupId}`).emit("message_reaction_removed", message);
      } else {
        const room = [message.sender._id, message.receiver].sort().join("_");
        io.to(room).emit("message_reaction_removed", message);
      }  
    } catch (error) {
        console.error("Error removing reaction:", error);
        socket.emit("error", { message: "Failed to remove reaction" });
      }
    }
  );

  // Handle member added to group
  socket.on("group_member_added", ({ groupId, newMember }) => {
    io.to(`group_${groupId}`).emit("member_added", { groupId, newMember });
  });

  // Handle member removed from group
  socket.on("group_member_removed", ({ groupId, removedMemberId }) => {
    io.to(`group_${groupId}`).emit("member_removed", { groupId, removedMemberId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//route
app.use("/api", authRoute);
app.use("/api", protectRoute, messageRouter);
app.use("/api", receiverRouter);
app.use("/api/groups", protectRoute, groupRouter);
app.use("/api/groups", protectRoute, groupMessageRouter);

// Use server.listen for both HTTP and WebSocket on the same port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open Browser: http://localhost:${port}`);
});
