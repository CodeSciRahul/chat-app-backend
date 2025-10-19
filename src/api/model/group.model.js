import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    profilePicture: { type: String, default: null },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            role: {
                type: String,
                enum: ["admin", "participant"],
                default: "participant"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
    settings: {
        isPrivate: { type: Boolean, default: false },
        allowMemberInvite: { type: Boolean, default: false },
        adminOnlyMessages: { type: Boolean, default: false }
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


export default mongoose.model("Group", groupSchema);