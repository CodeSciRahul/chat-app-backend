import { io } from "../../../server.js";
import { uploadFileToAws } from "../../util/uploadPicOnAws.js";
import {
    fetchMessages,
    createMessage,
    findMessageByIdWithPopulate,
    findMessageById,
    softDeleteMessageById
} from "../../database/operations/message.operation.js";
// REST API for retrieving chat messages
export const chatMessage = async(req,res) => {
    try {
        const { sender, receiver, groupId } = req.query;
        const messages = await fetchMessages(sender, receiver, groupId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

export const uploadDocument = async (req, res) => {
    try {
      const { sender, receiver, messageType, groupId, replyTo } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "No file provided" });
      }
        
      const fileName = file.originalname;
      const fileType = file.mimetype;  
      // Upload to AWS S3.
      const fileUrl = await uploadFileToAws(file.buffer, fileName, fileType);

      //save on database.
      const newMessage = await createMessage({ sender, receiver, fileUrl, fileType });

      const populatedMessage = await findMessageByIdWithPopulate(newMessage._id);

    const room = [sender, receiver].sort().join("_");
    io.to(room).emit("receive_message", populatedMessage);     
        res.status(200).send(newMessage);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
}

export const deletePrivateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = String(req.user?.userId || "");
        if (!messageId) return res.status(400).json({ message: "messageId is required" });
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const message = await findMessageById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (String(message.messageType) !== "private") {
            return res.status(400).json({ message: "Not a private message" });
        }

        // Only sender can delete for everyone (WhatsApp-style)
        if (String(message.sender) !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        const deletedMessage = await softDeleteMessageById(messageId);

        const room = [String(message.sender), String(message.receiver)].sort().join("_");
        io.to(room).emit("message:deleted", { messageId: String(messageId) });

        return res.status(200).json({
            message: "Message deleted successfully",
            data: deletedMessage
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete message", error: error.message });
    }
};
