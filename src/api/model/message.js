import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, // For text messages
    fileUrl: { type: String, default: null }, // For file uploads
    fileType: { type: String, default: null }, // e.g., 'image', 'video'
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
