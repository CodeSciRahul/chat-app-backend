import Message from "../../api/model/message.model.js";

// CREATE operations
export const createMessage = async (messageData) => {
    try {
        const { sender, receiver, content, fileUrl, fileType, groupId, messageType, replyTo } = messageData;
        
        const newMessage = new Message({
            sender,
            receiver,
            content,
            fileUrl,
            fileType,
            groupId,
            messageType,
            replyTo
        });
        
        return await newMessage.save();
    } catch (error) {
        throw new Error(`Failed to create message: ${error.message}`);
    }
};

// READ operations
export const findMessageById = async (messageId) => {
    try {
        return await Message.findById(messageId);
    } catch (error) {
        throw new Error(`Failed to find message by ID: ${error.message}`);
    }
};

export const findMessagesBySenderAndReceiver = async (sender, receiver) => {
    try {
        return await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ timestamp: 1 });
    } catch (error) {
        throw new Error(`Failed to find messages by sender and receiver: ${error.message}`);
    }
};

export const findMessagesBySenderAndReceiverWithPopulate = async (sender, receiver) => {
    try {
        return await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        })
        .sort({ timestamp: 1 })
        .populate('sender', 'name email')
        .populate('receiver', 'name email');
    } catch (error) {
        throw new Error(`Failed to find messages with populate: ${error.message}`);
    }
};

export const findMessageByIdWithPopulate = async (messageId) => {
    try {
        return await Message.findById(messageId)
            .populate("sender", "name email")
            .populate("receiver", "name email");
    } catch (error) {
        throw new Error(`Failed to find message by ID with populate: ${error.message}`);
    }
};

export const findMessagesBySender = async (senderId) => {
    try {
        return await Message.find({ sender: senderId, deleted: false });
    } catch (error) {
        throw new Error(`Failed to find messages by sender: ${error.message}`);
    }
};

export const findMessagesByReceiver = async (receiverId) => {
    try {
        return await Message.find({ receiver: receiverId, deleted: false });
    } catch (error) {
        throw new Error(`Failed to find messages by receiver: ${error.message}`);
    }
};

// UPDATE operations
export const updateMessageById = async (messageId, updateData) => {
    try {
        return await Message.findByIdAndUpdate(messageId, updateData, { new: true });
    } catch (error) {
        throw new Error(`Failed to update message: ${error.message}`);
    }
};

export const updateMessageContent = async (messageId, content) => {
    try {
        return await Message.findByIdAndUpdate(
            messageId, 
            { content }, 
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to update message content: ${error.message}`);
    }
};

// DELETE operations
export const softDeleteMessageById = async (messageId) => {
    try {
        return await Message.findByIdAndUpdate(messageId, { deleted: true }, { new: true });
    } catch (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
    }
};

export const softDeleteMessagesBySenderAndReceiver = async (sender, receiver) => {
    try {
        return await Message.updateMany({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ],
            deleted: false
        });
    } catch (error) {
        throw new Error(`Failed to delete messages by sender and receiver: ${error.message}`);
    }
};

export const softDeleteMessagesBySender = async (senderId) => {
    try {
        return await Message.updateMany({ sender: senderId, deleted: false });
    } catch (error) {
        throw new Error(`Failed to delete messages by sender: ${error.message}`);
    }
};

export const softDeleteMessagesByReceiver = async (receiverId) => {
    try {
        return await Message.updateMany({ receiver: receiverId, deleted: false });
    } catch (error) {
        throw new Error(`Failed to delete messages by receiver: ${error.message}`);
    }
};

// GROUP MESSAGE operations
export const findMessagesByGroupId = async (groupId, options = {}) => {
    try {
        const { page = 1, limit = 50 } = options;
        const skip = (page - 1) * limit;
        
        return await Message.find({ 
            groupId: groupId,
            deleted: false 
        })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sender', 'name email')
        .populate('replyTo', 'content sender')
        .populate('reactions.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to find messages by group ID: ${error.message}`);
    }
};

export const addReactionToMessage = async (messageId, userId, emoji) => {
    try {
        return await Message.findByIdAndUpdate(
            messageId,
            {
                $addToSet: {
                    reactions: {
                        user: userId,
                        emoji: emoji,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('sender', 'name email')
        .populate('reactions.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to add reaction to message: ${error.message}`);
    }
};

export const removeReactionFromMessage = async (messageId, userId) => {
    try {
        return await Message.findByIdAndUpdate(
            messageId,
            {
                $pull: {
                    reactions: { user: userId }
                }
            },
            { new: true }
        )
        .populate('sender', 'name email')
        .populate('reactions.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to remove reaction from message: ${error.message}`);
    }
};

export const findMessageByIdWithGroup = async (messageId) => {
    try {
        return await Message.findById(messageId)
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('groupId', 'name')
            .populate('replyTo', 'content sender')
            .populate('reactions.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to find message by ID with group: ${error.message}`);
    }
};