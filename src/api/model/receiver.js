import mongoose from 'mongoose'
const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
});

// Check if the model already exists
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;