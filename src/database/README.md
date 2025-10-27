# Centralized Database Operations

This folder contains centralized database operations for the chat application backend. All CRUD (Create, Read, Update, Delete) operations have been moved from scattered service files into dedicated operation files for better maintainability and consistency.

## Structure

```
src/database/operations/
├── index.js                    # Main export file for all operations
├── userOperations.js          # User-related CRUD operations
├── messageOperations.js       # Message-related CRUD operations
├── conversationOperations.js  # Conversation-related CRUD operations
└── README.md                  # This documentation file
```

## Benefits

1. **Centralized Management**: All database operations are now in one place
2. **Consistency**: Standardized error handling and response formats
3. **Maintainability**: Easy to update database logic without touching service files
4. **Reusability**: Operations can be reused across different service files
5. **Testing**: Easier to unit test database operations in isolation

## Usage

Import the operations you need from the centralized location:

```javascript
import {
    createUser,
    findUserByEmail,
    updateUserVerificationStatus,
    createMessage,
    findMessagesBySenderAndReceiverWithPopulate,
    createConversation,
    findConversationsByUserIdWithPopulate
} from "../../database/operations/index.js";
```

## Available Operations

### User Operations
- `createUser(userData)` - Create a new user
- `findUserById(userId)` - Find user by ID
- `findUserByEmail(email)` - Find user by email
- `findUserByMobile(mobile)` - Find user by mobile
- `findUserByEmailOrMobile(email, mobile)` - Find user by email or mobile
- `findAllUsers()` - Get all users
- `updateUserById(userId, updateData)` - Update user by ID
- `updateUserVerificationStatus(email, isVerified)` - Update verification status
- `updateUserPassword(userId, newPassword)` - Update user password
- `deleteUserById(userId)` - Delete user by ID
- `comparePassword(plainPassword, hashedPassword)` - Compare passwords
- `excludePasswordFromUser(user)` - Remove password from user object

### Message Operations
- `createMessage(messageData)` - Create a new message
- `findMessageById(messageId)` - Find message by ID
- `findMessagesBySenderAndReceiver(sender, receiver)` - Find messages between users
- `findMessagesBySenderAndReceiverWithPopulate(sender, receiver)` - Find messages with populated user data
- `findMessageByIdWithPopulate(messageId)` - Find message with populated data
- `findAllMessages()` - Get all messages
- `updateMessageById(messageId, updateData)` - Update message
- `deleteMessageById(messageId)` - Delete message
- And more...

### Conversation Operations
- `createConversation(conversationData)` - Create a new conversation
- `findConversationById(conversationId)` - Find conversation by ID
- `findConversationsByUserId(userId)` - Find conversations by user
- `findConversationsByUserIdWithPopulate(userId)` - Find conversations with populated data
- `addParticipantToConversation(userId, participantId)` - Add participant
- `removeParticipantFromConversation(userId, participantId)` - Remove participant
- `deleteConversationById(conversationId)` - Delete conversation
- And more...

## Migration Notes

The following service files have been refactored to use centralized operations:
- `src/api/services/user.js` - Now uses userOperations.js
- `src/api/services/message.js` - Now uses messageOperations.js  
- `src/api/services/conversation.js` - Now uses conversationOperations.js

All direct database operations have been removed from service files and replaced with calls to the centralized operations.
