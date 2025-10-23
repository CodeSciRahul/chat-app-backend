import {
    findConversationsByUserIdWithPopulate,
    findUserByEmailOrMobile,
    findConversationByUserIdAndParticipant,
    createConversation,
    removeParticipantFromConversation
} from "../../database/operations/index.js";
export const Participents = async (req, res) => {
    const { userId } = req.user;
    console.log("server triggered")

    try {
        const conversations = await findConversationsByUserIdWithPopulate(userId);
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
        const receiver = await findUserByEmailOrMobile(email, mobile);

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Check if a conversation already exists
        let conversation = await findConversationByUserIdAndParticipant(userId, receiver._id);
        if (!conversation) {
            conversation = await createConversation({ userId, participants: [receiver._id] });
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
        const conversation = await removeParticipantFromConversation(userId, receiverId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ message: 'Receiver removed successfully', conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}