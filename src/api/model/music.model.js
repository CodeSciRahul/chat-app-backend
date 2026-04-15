import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    musicLink: {
        type: String,
        required: true
    },
    musicId: {
        type: String,
        required: true
    },
    currentTime: {
        type: String,
        default: 0
    }

}, {timestamps: true})


export const MusicSchema = mongoose.model("music", musicSchema)