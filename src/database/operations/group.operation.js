import Group from "../../api/model/group.model.js";

// CREATE operations
const createGroup = async (payload) => {
    try {
        const group = await Group.create(payload);
        return await Group.findById(group._id)
            .populate('createdBy', 'name email')
            .populate('members.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to create group: ${error.message}`);
    }
}

// READ operations
const findGroupById = async (groupId) => {
    try {
        return await Group.findById(groupId)
            .populate('createdBy', 'name email')
            .populate('members.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to find group by ID: ${error.message}`);
    }
}

const allGroups = async (userId) => {
    try {
        const groups = await Group.find({
            'members.user': userId,
            deleted: false
        })
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email')
        .sort({ updatedAt: -1 });
        return groups;
    } catch (error) {
        throw new Error(`Failed to get all groups: ${error.message}`);
    }
}

const findGroupsByUserId = async (userId) => {
    try {
        return await Group.find({
            'members.user': userId,
            deleted: false
        })
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');
    } catch (error) {
        throw new Error(`Failed to find groups by user ID: ${error.message}`);
    }
}

const findGroupMembers = async (groupId) => {
    try {
        const group = await Group.findById(groupId)
            .populate('members.user', 'name email mobile')
            .select('members');
        return group ? group.members : [];
    } catch (error) {
        throw new Error(`Failed to find group members: ${error.message}`);
    }
}

const isUserGroupMember = async (groupId, userId) => {
    try {
        const group = await Group.findOne({
            _id: groupId,
            'members.user': userId,
            deleted: false
        });
        return !!group;
    } catch (error) {
        throw new Error(`Failed to check group membership: ${error.message}`);
    }
}

const isUserGroupAdmin = async (groupId, userId) => {
    try {
        const group = await Group.findOne({
            _id: groupId,
            'members.user': userId,
            'members.role': 'admin',
            deleted: false
        });
        return !!group;
    } catch (error) {
        throw new Error(`Failed to check admin status: ${error.message}`);
    }
}

// UPDATE operations
const updateGroup = async (groupId, payload) => {
    try {
        const group = await Group.findByIdAndUpdate(groupId, payload, { new: true })
            .populate('createdBy', 'name email')
            .populate('members.user', 'name email');
        return group;
    } catch (error) {
        throw new Error(`Failed to update group: ${error.message}`);
    }
}

const addMemberToGroup = async (groupId, userId, role = 'participant') => {
    try {
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                $addToSet: {
                    members: {
                        user: userId,
                        role: role,
                        joinedAt: new Date()
                    }
                }
            },
            { new: true }
        )
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');
        return group;
    } catch (error) {
        throw new Error(`Failed to add member to group: ${error.message}`);
    }
}

const removeMemberFromGroup = async (groupId, userId) => {
    try {
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                $pull: {
                    members: { user: userId }
                }
            },
            { new: true }
        )
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');
        return group;
    } catch (error) {
        throw new Error(`Failed to remove member from group: ${error.message}`);
    }
}

const updateMemberRole = async (groupId, userId, newRole) => {
    try {
        const group = await Group.findOneAndUpdate(
            {
                _id: groupId,
                'members.user': userId
            },
            {
                $set: {
                    'members.$.role': newRole
                }
            },
            { new: true }
        )
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');
        return group;
    } catch (error) {
        throw new Error(`Failed to update member role: ${error.message}`);
    }
}

const leaveGroup = async (groupId, userId) => {
    try {
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                $pull: {
                    members: { user: userId }
                }
            },
            { new: true }
        );
        return group;
    } catch (error) {
        throw new Error(`Failed to leave group: ${error.message}`);
    }
}

// DELETE operations
const softDeleteGroup = async (groupId) => {
    try {
        const group = await Group.findByIdAndUpdate(groupId, { deleted: true }, { new: true });
        return group;
    } catch (error) {
        throw new Error(`Failed to delete group: ${error.message}`);
    }
}

const hardDeleteGroup = async (groupId) => {
    try {
        return await Group.findByIdAndDelete(groupId);
    } catch (error) {
        throw new Error(`Failed to permanently delete group: ${error.message}`);
    }
}

export default {
    createGroup,
    findGroupById,
    allGroups,
    findGroupsByUserId,
    findGroupMembers,
    isUserGroupMember,
    isUserGroupAdmin,
    updateGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    updateMemberRole,
    leaveGroup,
    softDeleteGroup,
    hardDeleteGroup
}