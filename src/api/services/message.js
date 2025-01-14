import Message from "../model/message.js"
import { io } from "../../../server.js";
import { uploadFileToAws } from "../../util/uploadPicOnAws.js";
// REST API for retrieving chat messages
export const chatMessage = async(req,res) => {
    try {
        const { sender, receiver } = req.params;
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ timestamp: 1 }).populate('sender', 'name email') // Only populate sender's name and email (adjust fields as needed)
        .populate('receiver', 'name email');;
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

export const uploadDocument = async (req, res) => {
    try {
        const { sender, receiver} = req.body;
        console.log(sender, receiver)

      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "No file provided" });
      }
        
      const fileName = file.originalname;
      const fileType = file.mimetype;
      console.log(fileName, fileType)
  
      // Upload to AWS S3.
      const fileUrl = await uploadFileToAws(file.buffer, fileName, fileType);

      //save on database.
      const newMessage = new Message({ sender, receiver, fileUrl, fileType });
      await newMessage.save();

   const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    const room = [sender, receiver].sort().join("_");
    io.to(room).emit("receive_message", populatedMessage);     
        res.status(200).send(newMessage);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
}
