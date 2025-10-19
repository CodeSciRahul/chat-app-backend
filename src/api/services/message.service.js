import { io } from "../../../server.js";
import { uploadFileToAws } from "../../util/uploadPicOnAws.js";
import {
    findMessagesBySenderAndReceiverWithPopulate,
    createMessage,
    findMessageByIdWithPopulate
} from "../../database/operations/messageOperations.js";
// REST API for retrieving chat messages
export const chatMessage = async(req,res) => {
    try {
        const { sender, receiver } = req.params;
        const messages = await findMessagesBySenderAndReceiverWithPopulate(sender, receiver);
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
