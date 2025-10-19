import Conversation from "../../api/model/conversation.model.js";

// CREATE operations
export const createConversation = async (conversationData) => {
    try {
        const { userId, participants } = conversationData;
        
        const newConversation = new Conversation({
            userId,
            participants
        });
        
        return await newConversation.save();
    } catch (error) {
        throw new Error(`Failed to create conversation: ${error.message}`);
    }
};

// READ operations
export const findConversationById = async (conversationId) => {
    try {
        return await Conversation.findById(conversationId);
    } catch (error) {
        throw new Error(`Failed to find conversation by ID: ${error.message}`);
    }
};

export const findConversationsByUserId = async (userId) => {
    try {
        return await Conversation.find({ userId });
    } catch (error) {
        throw new Error(`Failed to find conversations by user ID: ${error.message}`);
    }
};

export const findConversationsByUserIdWithPopulate = async (userId) => {
    try {
        return await Conversation.find({ userId })
            .populate('participants', '_id name email mobile');
    } catch (error) {
        throw new Error(`Failed to find conversations with populate: ${error.message}`);
    }
};

export const findConversationByUserIdAndParticipant = async (userId, participantId) => {
    try {
        return await Conversation.findOne({ 
            userId, 
            participants: participantId 
        });
    } catch (error) {
        throw new Error(`Failed to find conversation by user and participant: ${error.message}`);
    }
};

export const findAllConversations = async () => {
    try {
        return await Conversation.find();
    } catch (error) {
        throw new Error(`Failed to find all conversations: ${error.message}`);
    }
};

// UPDATE operations
export const updateConversationById = async (conversationId, updateData) => {
    try {
        return await Conversation.findByIdAndUpdate(conversationId, updateData, { new: true });
    } catch (error) {
        throw new Error(`Failed to update conversation: ${error.message}`);
    }
};

export const addParticipantToConversation = async (userId, participantId) => {
    try {
        return await Conversation.findOneAndUpdate(
            { userId },
            { $addToSet: { participants: participantId } },
            { new: true, upsert: true }
        );
    } catch (error) {
        throw new Error(`Failed to add participant to conversation: ${error.message}`);
    }
};

export const removeParticipantFromConversation = async (userId, participantId) => {
    try {
        return await Conversation.findOneAndUpdate(
            { userId },
            { $pull: { participants: participantId } },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to remove participant from conversation: ${error.message}`);
    }
};

export const updateConversationParticipants = async (userId, participants) => {
    try {
        return await Conversation.findOneAndUpdate(
            { userId },
            { participants },
            { new: true, upsert: true }
        );
    } catch (error) {
        throw new Error(`Failed to update conversation participants: ${error.message}`);
    }
};

// DELETE operations
export const deleteConversationById = async (conversationId) => {
    try {
        return await Conversation.findByIdAndDelete(conversationId);
    } catch (error) {
        throw new Error(`Failed to delete conversation: ${error.message}`);
    }
};

export const deleteConversationsByUserId = async (userId) => {
    try {
        return await Conversation.deleteMany({ userId });
    } catch (error) {
        throw new Error(`Failed to delete conversations by user ID: ${error.message}`);
    }
};

export const deleteConversationByUserIdAndParticipant = async (userId, participantId) => {
    try {
        return await Conversation.findOneAndDelete({ 
            userId, 
            participants: participantId 
        });
    } catch (error) {
        throw new Error(`Failed to delete conversation by user and participant: ${error.message}`);
    }
};
