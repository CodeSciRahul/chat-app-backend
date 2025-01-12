import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const APP_PASSWORD = process.env.App_password;
const SENDER_EMAIL = process.env.Sender_email;
const FRONTED_URL = process.env.Frontend_url;
const Secret_key = process.env.Email_Verification_Secret_key;
const generateToken = async (RECEIVER_EMAIL) => {
  try {
    const payload = {
      receiver_mail: RECEIVER_EMAIL,
    };
    const token = jwt.sign(payload, Secret_key, { expiresIn: "30m" });
    return token;
  } catch (error) {
    throw new Error(error);
  }
};

export const sendEmail = async (RECEIVER_EMAIL) => {
  try {
    const token = await generateToken(RECEIVER_EMAIL);
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD,
      },
    });
    const command = {
      from: `Rahul kumar <${SENDER_EMAIL}>`,
      to: RECEIVER_EMAIL,
      subject: "Verification Email",
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Email Verification</title>
</head>
<body>
  <h1>Verify Your Email</h1>
  <p>Click the link below to verify your email address:</p>
 <p>
        <a href="${FRONTED_URL}/verify?token=${token}" style="color: #007BFF; text-decoration: none;">

          <strong>Click here to verify your account</strong>

        </a>

      </p>
  <p>If you did not request this email, please ignore it.</p>
</body>
</html>`,
    };
    const result = transport.sendMail(command);
    return result;
  } catch (error) {
    throw new Error(error?.message || "Error in Nodemailer");
  }
};
