import dotenv from "dotenv"
dotenv.config();

const properties = {
    PORT: Number(process.env.PORT) || 5000,
  
    SERVER_URL: process.env.SERVER_URL || `http://localhost:5000`,
  
    CLIENT_URL: process.env.Frontend_url || `http://localhost:5173`,
  
    MONGO_URL:
      process.env.MONGO_URL || `mongodb://localhost:27017/chat-app`,
    
    SALT_ROUND: Number(process.env.SALT_ROUND) || 10,

    SECERT_KEY: process.env.SECRET_KEY || "rahulkumar@1234",
    EMAIL_VERIFICATION_SECERT_KEY: process.env.Email_Verification_Secret_key || "himanshinehakhushi@787007183"

  
  };
  
  export default properties;