import User from "../model/User.js"; // Updated path for consistency
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import properties from "../../config/properties.js";
import {sendEmail} from "../../util/sendEmail.js"

dotenv.config();

const SALT_ROUND = properties?.SALT_ROUND || 10;
const SECRET_KEY = properties?.SECERT_KEY;

// Register User with Email Verification
export const register = async (req, res) => {
    const { name, email, mobile, password } = req.body;

    try {
        // Validate input
        if (!(name && email && mobile && password)) {
            return res.status(400).send({ message: "All fields are required" });
        }

        // Check if email or mobile already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { mobile }],
        });
        if (existingUser) {
            return res.status(400).send({
                message: "Email or Mobile number already registered",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

        // Create a new user (not yet verified)
        const newUser = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            isVerified: false, // Add this field in your schema
        });

        const savedUser = await newUser.save();

        // Send verification email
        const emailResult = await sendEmail(email);

        // Respond with success message
        return res.status(201).send({
            message: "Registration successful! A verification email has been sent to your email address.",
            userId: savedUser._id,
        });
    } catch (error) {
        return res.status(500).send({
            message: error?.message || "Internal Server Error",
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        if (!token) {
            return res.status(400).send({ message: "Token is required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.Email_Verification_Secret_key);

        // Update the user's verification status
        const user = await User.findOne({ email: decoded.receiver_mail });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).send({ message: "User is already verified" });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(500).send({
            message: error?.message || "Invalid or expired token",
        });
    }
};

// Login User
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!(email && password)) {
            return res.status(400).send({ message: "All fields are required" });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({
                message: "Invalid email or password",
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({
                message: "Invalid email or password",
            });
        }

        // Create payload for JWT
        const payload = { userId: user._id, email };

        // Generate token
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "48h" });

        // Exclude password from the response
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        // Send response
        return res.status(200).send({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        return res.status(500).send({
            message: error?.message || "Internal Server Error",
        });
    }
};
