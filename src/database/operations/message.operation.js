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
        const savedMessage = await newMessage.save();
        console.log("savedMessage", savedMessage);
        return savedMessage;
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
        }).sort({ createdAt: 1 });
    } catch (error) {
        throw new Error(`Failed to find messages by sender and receiver: ${error.message}`);
    }
};

export const fetchMessages = async (sender, receiver, groupId) => {
    try {
        const query = {};
        if(groupId){
            query.groupId = groupId;
        } else {
            query.$or = [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ];
        }        
        const messageQuery = Message.find(query).sort({ createdAt: 1 });
        
        // Conditionally populate based on context
        if (groupId) {
            // For group messages, populate sender, replyTo, reactions, and groupId
            messageQuery
                .populate('sender', 'name email')
                .populate({
                    path: 'replyTo',
                    populate: [
                        { path: 'sender', select: 'name email' },
                        { path: 'receiver', select: 'name email' },
                        { path: 'groupId', select: 'name' },
                        { path: 'reactions.user', select: 'name email' }
                    ]
                })
                .populate('reactions.user', 'name email')
                .populate('groupId', 'name');
        } else {
            // For private messages, populate sender, receiver, replyTo, and reactions
            messageQuery
                .populate('sender', 'name email')
                .populate('receiver', 'name email')
                .populate({
                    path: 'replyTo',
                    populate: [
                        { path: 'sender', select: 'name email' },
                        { path: 'receiver', select: 'name email' },
                        { path: 'reactions.user', select: 'name email' }
                    ]
                })
                .populate('reactions.user', 'name email');
        }
        
        return await messageQuery.exec();
    } catch (error) {
        throw new Error(`Failed to find messages with populate: ${error.message}`);
    }
};

export const findMessageByIdWithPopulate = async (messageId) => {
    try {
        let query = Message.findById(messageId)
        .populate("sender", "name email")
        .populate({
          path: "replyTo",
          populate: [
            { path: "sender", select: "name email" },
            { path: "receiver", select: "name email" },
            { path: "groupId", select: "name" },
            { path: "reactions.user", select: "name email" },
          ],
        })
        .populate("reactions.user", "name email");
      
      // First fetch message to check which field exists
      const msg = await Message.findById(messageId).lean();
      
      if (msg.receiver) {
        query = query.populate("receiver", "name email");
      }
      
      if (msg.groupId) {
        query = query.populate("groupId", "name");
      }
      
      const result = await query.exec();
      return result;
      
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

export const removeReactionFromMessage = async (messageId, reactionId) => {
    try {
        return await Message.findByIdAndUpdate(
            messageId,
            {
                $pull: {
                    reactions: { _id: reactionId }
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