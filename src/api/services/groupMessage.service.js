import { createMessage, findMessagesByGroupId, addReactionToMessage, removeReactionFromMessage, findMessageById, softDeleteMessageById } from "../../database/operations/message.operation.js";
import * as groupOperations from "../../database/operations/group.operation.js";

// Send Group Message
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;
        const { content, fileUrl, fileType, replyTo } = req.body;

        // Check if user is member of the group
        const isMember = await groupOperations.isUserGroupMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({ 
                message: "You are not a member of this group" 
            });
        }

        // Check if group has admin-only messaging setting
        const group = await groupOperations.findGroupById(groupId);
        if (group.settings.adminOnlyMessages) {
            const isAdmin = await groupOperations.isUserGroupAdmin(groupId, userId);
            if (!isAdmin) {
                return res.status(403).json({ 
                    message: "Only admins can send messages in this group" 
                });
            }
        }

        const messageData = {
            sender: userId,
            groupId: groupId,
            content,
            fileUrl,
            fileType,
            messageType: 'group',
            replyTo
        };

        const message = await createMessage(messageData);
        
        return res.status(201).json({ 
            message: "Message sent successfully", 
            message 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to send message", 
            error: error.message 
        });
    }
};

// Get Group Messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;
        const { page = 1, limit = 50 } = req.query;

        // Check if user is member of the group
        const isMember = await groupOperations.isUserGroupMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({ 
                message: "You are not a member of this group" 
            });
        }

        const messages = await findMessagesByGroupId(groupId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
        return res.status(200).json({ 
            message: "Group messages retrieved successfully", 
            messages 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to retrieve group messages", 
            error: error.message 
        });
    }
};

// Add Message Reaction
export const addMessageReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.user;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ 
                message: "Emoji is required" 
            });
        }

        const message = await addReactionToMessage(messageId, userId, emoji);
        
        return res.status(200).json({ 
            message: "Reaction added successfully", 
            message 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to add reaction", 
            error: error.message 
        });
    }
};

// Remove Message Reaction
export const removeMessageReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.user;

        const message = await removeReactionFromMessage(messageId, userId);
        
        return res.status(200).json({ 
            message: "Reaction removed successfully", 
            message 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to remove reaction", 
            error: error.message 
        });
    }
};

// Delete Group Message (for everyone)
export const deleteGroupMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.user;

        // Check if user is admin or message sender
        const message = await findMessageById(messageId);
        if (!message) {
            return res.status(404).json({ 
                message: "Message not found" 
            });
        }

        const isAdmin = await groupOperations.isUserGroupAdmin(message.groupId, userId);
        const isSender = message.sender.toString() === userId;

        if (!isAdmin && !isSender) {
            return res.status(403).json({ 
                message: "You can only delete your own messages or be an admin" 
            });
        }

        const deletedMessage = await softDeleteMessageById(messageId);
        
        return res.status(200).json({ 
            message: "Message deleted successfully", 
            message: deletedMessage 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to delete message", 
            error: error.message 
        });
    }
};
