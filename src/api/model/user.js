import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  mobile: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // New field
  googleId: { type: String, default: null }, // For Google login
  facebookId: { type: String, default: null }, // For Facebook login
  linkedinId: { type: String, default: null }, // For LinkedIn login
}, { timestamps: true });

export default mongoose.model('User', userSchema);
