import express from 'express';
import {
    sendGroupMessage,
    getGroupMessages,
    addMessageReaction,
    removeMessageReaction,
    deleteGroupMessage
} from '../services/groupMessage.service.js';

const router = express.Router();

// Group messaging routes
router.post('/:groupId/messages', sendGroupMessage);           // Send message to group
router.get('/:groupId/messages', getGroupMessages);           // Get group messages
router.post('/messages/:messageId/reactions', addMessageReaction);    // Add reaction
router.delete('/messages/:messageId/reactions', removeMessageReaction); // Remove reaction
router.delete('/messages/:messageId', deleteGroupMessage);    // Delete message

export { router as groupMessageRouter };
