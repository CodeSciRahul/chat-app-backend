import {
    findConversationsByUserIdWithPopulate,
    findUserByEmailOrMobile,
    findConversationByUserIdAndParticipant,
    createConversation,
    deleteConversationByUserIdAndParticipant,
    deleteConversationsByConversationIds
} from "../../database/operations/index.js";
import {asyncHandler} from "../../util/asyncHandler.util.js"
import {ApiResponse} from "../../util/apiResponse.util.js"
export const Participents = async (req, res) => {
    const { userId } = req.user;
    console.log("server triggered")

    try {
        const conversations = await findConversationsByUserIdWithPopulate(userId);
        if (!conversations) {
            return res.status(404).json({ message: 'No conversations found' });
        }

        const receiversMap = new Map();
        for (const conversation of conversations) {
            const participant = (conversation.participants || []).find(
                (p) => p?._id?.toString() !== userId
            );
            if (!participant?._id) continue;

            const lastMessage = conversation.last_message || null;
            receiversMap.set(participant._id.toString(), {
                ...participant.toObject?.() ?? participant,
                conversationId: conversation._id,
                lastMessage
            });
        }

        const receivers = Array.from(receiversMap.values());

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
        const conversation = await deleteConversationByUserIdAndParticipant(userId, receiverId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ message: 'Conversation deleted successfully', conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteMultipleParticipents = asyncHandler( async (req, res) => {
    const {conversationIds} = req.body

    const conversations = await deleteConversationsByConversationIds(conversationIds)
    if (!conversations) {
        return ApiResponse(res, 404, "Conversations not found")
    }
    return ApiResponse(res, 200, "Conversations deleted successfully", conversations)
})