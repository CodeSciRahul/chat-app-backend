import User from "../../api/model/user.model.js";
import bcrypt from "bcrypt";
import properties from "../../config/properties.js";

const SALT_ROUND = properties?.SALT_ROUND || 10;

// CREATE operations
export const createUser = async (userData) => {
    try {
        const { name, email, mobile, password, isVerified = false } = userData;
        
        // Hash the password if provided
        let hashedPassword = password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, SALT_ROUND);
        }
        
        const newUser = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            isVerified
        });
        
        return await newUser.save();
    } catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
};

// READ operations
export const findUserById = async (userId) => {
    try {
        return await User.findById(userId);
    } catch (error) {
        throw new Error(`Failed to find user by ID: ${error.message}`);
    }
};

export const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error(`Failed to find user by email: ${error.message}`);
    }
};

export const findUserByMobile = async (mobile) => {
    try {
        return await User.findOne({ mobile });
    } catch (error) {
        throw new Error(`Failed to find user by mobile: ${error.message}`);
    }
};

export const findUserByEmailOrMobile = async (email, mobile) => {
    try {
        return await User.findOne({
            $or: [{ email }, { mobile }]
        });
    } catch (error) {
        throw new Error(`Failed to find user by email or mobile: ${error.message}`);
    }
};

export const findAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error(`Failed to find all users: ${error.message}`);
    }
};

export const findUserByEmailForVerification = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error(`Failed to find user for verification: ${error.message}`);
    }
};

// UPDATE operations
export const updateUserById = async (userId, updateData) => {
    try {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    } catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

export const updateUserVerificationStatus = async (email, isVerified = true) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        
        user.isVerified = isVerified;
        return await user.save();
    } catch (error) {
        throw new Error(`Failed to update user verification status: ${error.message}`);
    }
};

export const updateUserPassword = async (userId, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUND);
        return await User.findByIdAndUpdate(
            userId, 
            { password: hashedPassword }, 
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to update user password: ${error.message}`);
    }
};

// DELETE operations
export const deleteUserById = async (userId) => {
    try {
        return await User.findByIdAndDelete(userId);
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

export const deleteUserByEmail = async (email) => {
    try {
        return await User.findOneAndDelete({ email });
    } catch (error) {
        throw new Error(`Failed to delete user by email: ${error.message}`);
    }
};

// UTILITY operations
export const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        throw new Error(`Failed to compare password: ${error.message}`);
    }
};

export const excludePasswordFromUser = (user) => {
    if (!user) return null;
    
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
};
