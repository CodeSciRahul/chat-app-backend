import groupOperations from "../../database/operations/group.operation.js";
import { findUserByEmailOrMobile } from "../../database/operations/user.operation.js";
import { uploadFileToAws } from "../../util/uploadPicOnAws.js";

export const createGroup = async (req, res) => {
    try {
        const { userId } = req.user;
        const { name, description, memberEmails = [] } = req.body;
        const file = req.file; // Get uploaded file from multer

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const memberUsers = [];
        for (const email of memberEmails) {
            const user = await findUserByEmailOrMobile(email, null);
            if (user && user._id.toString() !== userId) {
                memberUsers.push({
                    user: user._id,
                    role: 'participant',
                    joinedAt: new Date()
                });
            }
        }
        const members = [
            {
                user: userId,
                role: 'admin',
                joinedAt: new Date()
            },
            ...memberUsers
        ];

        // Handle profile picture upload
        let profilePictureUrl;
        if (file) {
            // Upload image to AWS S3
            const fileName = file.originalname;
            const fileType = file.mimetype;
            profilePictureUrl = await uploadFileToAws(file.buffer, fileName, fileType);
        }

        const groupData = {
            name,
            description,
            profilePicture: profilePictureUrl,
            createdBy: userId,
            members
        };

        const group = await groupOperations.createGroup(groupData);
        
        return res.status(201).json({ 
            message: "Group created successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to create group", 
            error: error.message 
        });
    }
};

// Get All Groups for User
export const getUserGroups = async (req, res) => {
    try {
        const { userId } = req.user;
        const groups = await groupOperations.allGroups(userId);
        
        return res.status(200).json({ 
            message: "Groups retrieved successfully", 
            groups 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to retrieve groups", 
            error: error.message 
        });
    }
};

// Get Group Details
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        // Check if user is member of the group
        const isMember = await groupOperations.isUserGroupMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({ 
                message: "You are not a member of this group" 
            });
        }

        const group = await groupOperations.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ 
                message: "Group not found" 
            });
        }

        return res.status(200).json({ 
            message: "Group details retrieved successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to retrieve group details", 
            error: error.message 
        });
    }
};

// Update Group
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;
        const { name, description, settings } = req.body;
        const file = req.file; // Get uploaded file from multer

        // Check if user is admin
        const isAdmin = await groupOperations.isUserGroupAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({ 
                message: "Only admins can update group details" 
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (settings) updateData.settings = settings;

        // Handle profile picture upload
        if (file) {
            // Upload image to AWS S3
            const fileName = file.originalname;
            const fileType = file.mimetype;
            const fileUrl = await uploadFileToAws(file.buffer, fileName, fileType);
            updateData.profilePicture = fileUrl;
        }
        const group = await groupOperations.updateGroup(groupId, updateData);
        
        return res.status(200).json({ 
            message: "Group updated successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to update group", 
            error: error.message 
        });
    }
};

// Add Member to Group
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;
        const { email, mobile, role = 'participant' } = req.body;

        // Check if user is admin
        const isAdmin = await groupOperations.isUserGroupAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({ 
                message: "Only admins can add members" 
            });
        }

        // Find user by email or mobile
        const userToAdd = await findUserByEmailOrMobile(email, mobile);
        if (!userToAdd) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Check if user is already a member
        const isAlreadyMember = await groupOperations.isUserGroupMember(groupId, userToAdd._id);
        if (isAlreadyMember) {
            return res.status(400).json({ 
                message: "User is already a member of this group" 
            });
        }

        const group = await groupOperations.addMemberToGroup(groupId, userToAdd._id, role);
        
        return res.status(200).json({ 
            message: "Member added successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to add member", 
            error: error.message 
        });
    }
};

// Remove Member from Group
export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { userId } = req.user;

        // Check if user is admin
        const isAdmin = await groupOperations.isUserGroupAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({ 
                message: "Only admins can remove members" 
            });
        }

        // Check if trying to remove self
        if (memberId === userId) {
            return res.status(400).json({ 
                message: "You cannot remove yourself. Use leave group instead." 
            });
        }

        const group = await groupOperations.removeMemberFromGroup(groupId, memberId);
        
        return res.status(200).json({ 
            message: "Member removed successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to remove member", 
            error: error.message 
        });
    }
};

// Update Member Role
export const updateMemberRole = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { userId } = req.user;
        const { role } = req.body;

        if (!['admin', 'participant'].includes(role)) {
            return res.status(400).json({ 
                message: "Invalid role. Must be 'admin' or 'participant'" 
            });
        }

        // Check if user is admin
        const isAdmin = await groupOperations.isUserGroupAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({ 
                message: "Only admins can update member roles" 
            });
        }

        const group = await groupOperations.updateMemberRole(groupId, memberId, role);
        
        return res.status(200).json({ 
            message: "Member role updated successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to update member role", 
            error: error.message 
        });
    }
};

// Leave Group
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        const group = await groupOperations.leaveGroup(groupId, userId);
        
        return res.status(200).json({ 
            message: "Left group successfully", 
            group 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to leave group", 
            error: error.message 
        });
    }
};

// Get Group Members
export const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        // Check if user is member of the group
        const isMember = await groupOperations.isUserGroupMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({ 
                message: "You are not a member of this group" 
            });
        }

        const members = await groupOperations.findGroupMembers(groupId);
        
        return res.status(200).json({ 
            message: "Group members retrieved successfully", 
            members 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to retrieve group members", 
            error: error.message 
        });
    }
};

// Delete Group
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        // First, get the group to check the createdBy field
        const group = await groupOperations.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ 
                message: "Group not found" 
            });
        }

        // Check if user is the creator of the group
        if (group.createdBy._id.toString() !== userId) {
            return res.status(403).json({ 
                message: "Only the group creator can delete the group" 
            });
        }

        // Soft delete the group
        const deletedGroup = await groupOperations.softDeleteGroup(groupId);
        
        return res.status(200).json({ 
            message: "Group deleted successfully", 
            group: deletedGroup 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to delete group", 
            error: error.message 
        });
    }
};