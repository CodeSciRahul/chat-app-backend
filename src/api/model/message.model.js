import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    mark: {
        type: Boolean,
        default: false
    },
    messageType: {
        type: String,
        enum: ["private", "group"],
        default: "private"
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    reactions: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            emoji: {
                type: String,
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
