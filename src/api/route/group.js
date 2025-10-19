import express from 'express';
import {
    createGroup,
    getUserGroups,
    getGroupDetails,
    updateGroup,
    addMember,
    removeMember,
    updateMemberRole,
    leaveGroup,
    getGroupMembers,
    deleteGroup
} from '../services/group.service.js';

const router = express.Router();

// Group CRUD operations
router.post('/', createGroup);                    // Create new group
router.get('/', getUserGroups);                   // Get user's groups
router.get('/:groupId', getGroupDetails);         // Get group details
router.put('/:groupId', updateGroup);             // Update group
router.delete('/:groupId', deleteGroup);          // Delete group

// Member management
router.post('/:groupId/members', addMember);      // Add member to group
router.delete('/:groupId/members/:memberId', removeMember); // Remove member
router.put('/:groupId/members/:memberId/role', updateMemberRole); // Update member role
router.get('/:groupId/members', getGroupMembers); // Get group members
router.post('/:groupId/leave', leaveGroup);       // Leave group

export { router as groupRouter };
