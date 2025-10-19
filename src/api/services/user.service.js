import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import properties from "../../config/properties.js";
import {sendEmail} from "../../util/sendEmail.js";
import {
    createUser,
    findUserByEmailOrMobile,
    findUserByEmail,
    updateUserVerificationStatus,
    comparePassword,
    excludePasswordFromUser,
    findAllUsers
} from "../../database/operations/user.operation.js";

dotenv.config();

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
        const existingUser = await findUserByEmailOrMobile(email, mobile);
        if (existingUser) {
            return res.status(400).send({
                message: "Email or Mobile number already registered",
            });
        }

        // Create a new user (not yet verified)
        const savedUser = await createUser({
            name,
            email,
            mobile,
            password,
            isVerified: false
        });

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

//verify Email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        if (!token) {
            return res.status(400).send({ message: "Token is required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.Email_Verification_Secret_key);

        // Update the user's verification status
        const user = await findUserByEmail(decoded.receiver_mail);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).send({ message: "User is already verified" });
        }

        await updateUserVerificationStatus(decoded.receiver_mail, true);

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
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).send({
                message: "Invalid email or password",
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
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
        const userWithoutPassword = excludePasswordFromUser(user);

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

//all users
export const allUsers = async (req, res) => {
    try {
      const users = await findAllUsers();
      res.status(200).send({
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};
