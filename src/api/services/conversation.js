import Conversation from "../model/receiver.js"
import User from "../model/user.js"
export const Participents = async (req, res) => {
    const { userId } = req.user;

    try {
        const conversations = await Conversation.find({ userId }).populate('participants', '_id name email mobile');
        if (!conversations) {
            return res.status(404).json({ message: 'No conversations found' });
        }

        const receivers = conversations.flatMap(conversation =>
            conversation.participants.filter(participant => participant._id.toString() !== userId)
        );

        res.status(200).json({ receivers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const addParticipents = async (req, res) => {
    const { userId } = req.user;
    const { email, mobile } = req.body;

    try {
        // Find the receiver by email or mobile
        const receiver = await User.findOne({ $or: [{ email }, { mobile }] });

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Check if a conversation already exists
        let conversation = await Conversation.findOne({ userId, participants: receiver._id });
        if (!conversation) {
            conversation = new Conversation({ userId, participants: [receiver._id] });
            await conversation.save();
        }

        res.status(201).json({ message: 'Receiver added successfully', conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteParticipents = async (req, res) => {
    const { receiverId } = req.params;
    const {userId} = req.user

    try {
        const conversation = await Conversation.findOneAndUpdate(
            { userId },
            { $pull: { participants: receiverId } },
            { new: true } // Return the updated document
        );

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ message: 'Receiver removed successfully', conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}