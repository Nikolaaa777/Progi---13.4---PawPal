# Chat System API Testing Guide

## Step 1: Run Database Migrations

**YES, you need to run migrations to create the chat tables!**

The migration file has already been created. Run this command in the `bekend` directory:

```bash
cd bekend
python manage.py migrate
```

This will create two new tables in your database:
- `chat_conversation` - stores conversations between users
- `chat_message` - stores individual messages

## Step 2: Start the Django Server

```bash
cd bekend
python manage.py runserver
```

## Step 3: Access API Documentation

Open your browser and go to:
```
http://localhost:8000/api/docs/
```

You'll see the Swagger UI with all available endpoints, including the new chat endpoints.

## Step 4: Testing Chat Endpoints in API Docs

### Important: Authentication Setup

The chat endpoints require authentication. The API uses **session-based authentication** (cookies). Here's how to test:

### Option A: Using Browser Developer Tools (Recommended for Swagger)

1. **First, create test users** (if you don't have them):
   - Use `/api/auth/register/` endpoint to create at least 2 users
   - Example for User 1:
     ```json
     {
       "email": "user1@example.com",
       "first_name": "John",
       "last_name": "Doe",
       "password": "password123",
       "is_walker": false
     }
     ```
   - Example for User 2:
     ```json
     {
       "email": "user2@example.com",
       "first_name": "Jane",
       "last_name": "Smith",
       "password": "password123",
       "is_walker": false
     }
     ```

2. **Login as User 1**:
   - Go to `/api/auth/login/` endpoint
   - Click "Try it out"
   - Enter:
     ```json
     {
       "email": "user1@example.com",
       "password": "password123"
     }
   - Click "Execute"
   - **Important**: The browser will store the session cookie automatically

3. **Now test chat endpoints** (while still logged in as User 1):
   
   a. **Get list of users**:
      - Endpoint: `GET /api/chat/users/`
      - Click "Try it out" → "Execute"
      - This will show all users (except yourself)
      - Note the `id` of user2 (e.g., `2`)

   b. **Create/Get a conversation with User 2**:
      - Endpoint: `POST /api/chat/conversations/user/{user_id}/`
      - Replace `{user_id}` with User 2's ID (e.g., `2`)
      - Click "Try it out" → "Execute"
      - This creates a new conversation or returns existing one
      - **Save the conversation `id` from the response** (e.g., `1`)

   c. **Send a message**:
      - Endpoint: `POST /api/chat/messages/`
      - Click "Try it out"
      - Enter:
        ```json
        {
          "conversation_id": 1,
          "content": "Hello! This is my first message."
        }
        ```
      - Click "Execute"
      - You should see a 201 response with the created message

   d. **Get all conversations**:
      - Endpoint: `GET /api/chat/conversations/`
      - Click "Try it out" → "Execute"
      - This shows all conversations for the logged-in user
      - You should see the conversation with User 2

   e. **Get specific conversation with messages**:
      - Endpoint: `GET /api/chat/conversations/{conversation_id}/`
      - Replace `{conversation_id}` with the ID from step b (e.g., `1`)
      - Click "Try it out" → "Execute"
      - This returns the conversation details and all messages

4. **Test as User 2** (to see the other side):
   - Logout: `POST /api/auth/logout/`
   - Login as User 2: `POST /api/auth/login/` with User 2's credentials
   - Get conversations: `GET /api/chat/conversations/`
   - You should see the conversation with User 1
   - Get the conversation: `GET /api/chat/conversations/{conversation_id}/`
   - You'll see the message User 1 sent
   - Send a reply: `POST /api/chat/messages/` with the conversation_id and a new message

### Option B: Using cURL or Postman

If you prefer using cURL or Postman:

1. **Login first** (this sets a session cookie):
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email": "user1@example.com", "password": "password123"}' \
     -c cookies.txt
   ```

2. **Use the cookie for authenticated requests**:
   ```bash
   curl -X GET http://localhost:8000/api/chat/conversations/ \
     -b cookies.txt
   ```

## Testing Checklist

- [ ] Migrations run successfully
- [ ] Can register users
- [ ] Can login and get session cookie
- [ ] Can get list of users
- [ ] Can create/get conversation
- [ ] Can send a message
- [ ] Can list conversations
- [ ] Can get conversation with messages
- [ ] Messages appear for both participants
- [ ] Unread count works correctly

## Quick Test Flow

1. Register User 1 → Login User 1
2. Register User 2 → Login User 2 → Get User 1's ID from `/api/chat/users/`
3. Login User 1 → Create conversation with User 2 → Send message
4. Login User 2 → Get conversations → See User 1's message → Send reply
5. Login User 1 → Get conversation → See User 2's reply

## Troubleshooting

**Issue: Getting 401 Unauthorized**
- Make sure you're logged in first (use `/api/auth/login/`)
- The browser needs to store the session cookie

**Issue: Getting 404 Not Found for conversation**
- Make sure the conversation_id is correct
- Make sure you're logged in as one of the participants

**Issue: No users showing in `/api/chat/users/`**
- Make sure you have at least 2 users registered
- The endpoint excludes the current user, so you need at least 2 users total

**Issue: Tables don't exist**
- Run `python manage.py migrate` in the `bekend` directory
- Check with `python manage.py showmigrations chat` to verify migrations are applied

## Database Tables Created

After migration, you'll have:
- `chat_conversation` - stores conversations
- `chat_message` - stores messages

You can verify this in Django admin or by checking your database directly.
