# Chat App Backend

A real-time chat application backend built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. This backend supports real-time messaging, file uploads, and basic CRUD operations for managing users and conversations.

---

## Features
- Real-time messaging between users with Socket.IO.
- File upload support for images, videos, and documents.
- User authentication and authorization.
- CRUD operations for managing users and conversations.
- RESTful APIs for client interaction.

---

## Technologies Used
- **Node.js**: Backend runtime environment.
- **Express.js**: Framework for building the RESTful API.
- **Socket.IO**: For real-time communication.
- **MongoDB**: Database for storing user and message data.
- **Multer**: Middleware for file uploads.
- **AWS S3**: For storing uploaded files (or local storage).

---

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: [Download](https://nodejs.org/)
- **MongoDB**: [Download](https://www.mongodb.com/try/download/community)
- **npm**: Comes with Node.js.
- A code editor like **VS Code**.

---
# Environment Variables

The following environment variables are required to run the Chat App Backend. Add these variables to a `.env` file in the root directory of your project.

# MongoDB Configuration
MONGO_URL=your_mongodb_connection_string

# Server Configuration
PORT=your_server_port

# Security Configuration
SALT_ROUND=your_salt_round_number
SECRET_KEY=your_secret_key

# AWS S3 Configuration
Access_key=your_aws_access_key
S3_Secret_key=your_aws_s3_secret_key
Bucket_Name=your_s3_bucket_name
Region=your_aws_region

# Email Configuration
App_password=your_email_app_password
Sender_email=your_email_address
Frontend_url=your_frontend_url
Email_Verification_Secret_key=your_email_verification_secret_key

## Getting Started
### .Run following cmd. 
```bash
git clone https://github.com/CodeSciRahul/chat-app-backend.git
npm install
nodemon server


