import mongoose from 'mongoose'
const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  custom_prompts: [{
    type: String,
  }],
  last_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;