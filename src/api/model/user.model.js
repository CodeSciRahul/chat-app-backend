import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, trim: true, default: null },
  mobile: { type: String, default: null, unique: true, trim: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // New field
  googleId: { type: String, default: null }, // For Google login
  facebookId: { type: String, default: null }, // For Facebook login
  linkedinId: { type: String, default: null }, // For LinkedIn login
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
