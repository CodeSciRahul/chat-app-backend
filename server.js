import express from "express";
import cors from "cors"
import bodyParser from "body-parser";
import dotenv from "dotenv"
import connectDB from "./src/config/dbConfig.js";
import properties from "./src/config/properties.js";
import {protectRoute} from "./src/api/middlewares/protectedRoute.js"
import { Server } from 'socket.io';
import http from 'http';
import { upload } from "./src/api/middlewares/handleFile.js";


//different route
import { authRoute } from "./src/api/route/auth.js";
import { messageRouter } from "./src/api/route/message.js"; 

dotenv.config();

//connect DB
connectDB(properties.MONGO_URL).catch(err => {
    console.error('Failed to connect to MongoDB', err)});

const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});


// Updated CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join rooms for private messaging
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
        const { sender, receiver, content } = data;

        // Save message to database
        const newMessage = new Message({ sender, receiver, content });
        await newMessage.save();

        // Emit the message to the receiver
        io.to(receiver).emit('receive_message', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
  
  })



 //route
 app.use("/api", authRoute)
 app.use("/api",protectRoute, messageRouter)

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Open Browser: http://localhost:${port}`);
  });