import { chatMessage,uploadDocument, deletePrivateMessage } from "../services/message.service.js";
import { upload } from "../middlewares/handleFile.js";

import { Router } from "express";

export const messageRouter = Router()

messageRouter.get("/chats", chatMessage)
messageRouter.post("/upload", upload.single('file'), uploadDocument)
messageRouter.delete("/messages/:messageId", deletePrivateMessage)