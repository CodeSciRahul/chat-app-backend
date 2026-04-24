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
  removeReactionFromMessage,
  markMessageDelivered,
  markMessagesSeen
} from "./src/database/operations/message.operation.js";
import { 
  createConversation, 
  findConversationByUserIdAndParticipant,
  upsertConversationLastMessage
} from "./src/database/operations/conversation.operation.js";

//different route
import { authRoute } from "./src/api/route/auth.js";
import { messageRouter } from "./src/api/route/message.js";
import { receiverRouter } from "./src/api/route/receiver.js";
import { groupRouter } from "./src/api/route/group.js";
import { groupMessageRouter } from "./src/api/route/groupMessage.js";
import { errorHandler } from "./src/api/middlewares/errorHandle.middleware.js";
import { musicRouter } from "./src/api/route/music.route.js";

//util
import { generateRoomId } from "./src/util/generateRoomId.util.js";
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
app.use(errorHandler)

// Preflight requests handler
app.options("*", cors(corsOptions)); // Handles preflight for all routes
app.use(bodyParser.json());

const port = Number(properties.PORT) || 5000;

// In-memory "listen together" state per room.
// NOTE: This resets when the server restarts (good enough for MVP).
const musicRoomState = new Map(); // roomId -> { roomId, song, isPlaying, positionSec, updatedAtMs, action }

// In-memory presence state (userId -> Set<socketId>)
const onlineUsers = new Map();

app.get("/", async (req, res) => {
  return res.send(`<h1>Running backend on Port : ${port}</h1>`);
});

io.on("connection", (socket) => {
  // Presence: mark online and broadcast.
  socket.on("presence:online", ({ userId }) => {
    if (!userId) return;

    socket.data.userId = String(userId);
    const id = String(userId);
    const set = onlineUsers.get(id) || new Set();
    const wasOnline = set.size > 0;
    set.add(socket.id);
    onlineUsers.set(id, set);

    if (!wasOnline) {
      io.emit("presence:update", { userId: id, online: true });
    }
  });

  // Presence: allow clients to fetch initial list.
  socket.on("presence:get", () => {
    const ids = Array.from(onlineUsers.entries())
      .filter(([_, sockets]) => sockets && sockets.size > 0)
      .map(([userId]) => userId);
    socket.emit("presence:list", { onlineUserIds: ids });
  });

  // Join private room for two users
  socket.on("join_room", ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join("_"); // Unique room name
    socket.join(room);
    console.log(`User joined room: ${room}`);

    const state = musicRoomState.get(room);
    if (state) {
      socket.emit("music:state", state);
    }
  });
   // Leave room
   socket.on("leave_room", ({ senderId, receiverId }) => {
    socket.leave([senderId, receiverId].sort().join("_"));
    console.log(`User ${senderId} left room: ${receiverId}`);
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

  
  socket.on("send_message", async ({ senderId, receiverId, content, fileUrl, fileType, replyTo, clientMessageId }) => {
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
      // Attach clientMessageId so sender can replace optimistic message
      const emittedMessage = {
        ...(populatedMessage?.toObject?.() ?? populatedMessage),
        clientMessageId: clientMessageId || null,
      };

      // Check if a conversation already exists using database operations
      let conversation = await findConversationByUserIdAndParticipant(senderId, receiverId);
      if (!conversation) {
        conversation = await createConversation({ 
          userId: senderId, 
          participants: [receiverId] 
        });
      }

      // Keep last message updated for BOTH users' conversation lists
      await Promise.all([
        upsertConversationLastMessage(senderId, receiverId, newMessage._id),
        upsertConversationLastMessage(receiverId, senderId, newMessage._id),
      ]);

      // Emit the message to the room
      io.to(room).emit("receive_message", emittedMessage);

      // Mark delivered if receiver is online (at least one socket)
      const receiverSockets = onlineUsers.get(String(receiverId));
      if (receiverSockets && receiverSockets.size > 0) {
        const updated = await markMessageDelivered(newMessage._id);
        if (updated?.deliveredAt) {
          io.to(room).emit("message:status", {
            messageId: String(newMessage._id),
            deliveredAt: updated.deliveredAt,
            seenAt: updated.seenAt || null,
          });
        }
      }
    } catch (error) {
      console.error("Error sending private message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Seen receipts (private chat)
  socket.on("message:seen", async ({ messageIds, viewerId, otherUserId }) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;
      if (!viewerId || !otherUserId) return;

      await markMessagesSeen({ messageIds, viewerId });

      const room = [viewerId, otherUserId].sort().join("_");
      io.to(room).emit("message:status", {
        messageIds: messageIds.map(String),
        seenAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking messages seen:", error);
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
    const id = socket.data?.userId ? String(socket.data.userId) : null;
    if (id) {
      const set = onlineUsers.get(id);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(id);
          io.emit("presence:update", { userId: id, online: false });
        } else {
          onlineUsers.set(id, set);
        }
      }
    }
    console.log("User disconnected:", socket.id);
  });

  const upsertAndBroadcastMusicState = (roomId, patch) => {
    const prev = musicRoomState.get(roomId) || {
      roomId,
      song: null,
      isPlaying: false,
      positionSec: 0,
      updatedAtMs: Date.now(),
      action: "select",
    };

    const next = {
      ...prev,
      ...patch,
      roomId,
      updatedAtMs: Date.now(),
    };

    musicRoomState.set(roomId, next);
    io.to(roomId).emit("music:state", next);
  };

  socket.on("music:select", ({ senderId, receiverId, song }) => {
    const roomId = generateRoomId(senderId, receiverId);
    console.log("music:select", roomId)
    upsertAndBroadcastMusicState(roomId, {
      song,
      isPlaying: true,
      positionSec: 0,
      action: "select",
    });
  });

  socket.on("music:play", ({ senderId, receiverId, positionSec = 0 }) => {
    const roomId = generateRoomId(senderId, receiverId);
    console.log("music:play", roomId)
    upsertAndBroadcastMusicState(roomId, {
      isPlaying: true,
      positionSec: Number(positionSec) || 0,
      action: "play",
    });
  });

  socket.on("music:pause", ({ senderId, receiverId, positionSec = 0 }) => {
    const roomId = generateRoomId(senderId, receiverId);
    console.log("music:pause", roomId)
    upsertAndBroadcastMusicState(roomId, {
      isPlaying: false,
      positionSec: Number(positionSec) || 0,
      action: "pause",
    });
  });

  socket.on("music:seek", ({ senderId, receiverId, positionSec = 0 }) => {
    const roomId = generateRoomId(senderId, receiverId);
    console.log("music:seek", roomId)
    upsertAndBroadcastMusicState(roomId, {
      positionSec: Number(positionSec) || 0,
      action: "seek",
    });
  });
});

//route
app.use("/api", authRoute);
app.use("/api", protectRoute, messageRouter);
app.use("/api", receiverRouter);
app.use("/api/groups", protectRoute, groupRouter);
app.use("/api/groups", protectRoute, groupMessageRouter);
app.use("/api/music", musicRouter)

// Use server.listen for both HTTP and WebSocket on the same port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open Browser: http://localhost:${port}`);
});
