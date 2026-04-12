# Vi-SlideS Backend Setup

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB
**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account
- Create a cluster
- Copy the connection string
- Update `.env` file with your connection string

### 3. Start Backend Server
```bash
npm run dev
# Or for production:
npm start
```

The server will run on `http://localhost:5000`

### 4. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456","confirmPassword":"123456","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

## API Endpoints

### POST /api/auth/signup
Sign up a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "confirmPassword": "123456",
  "role": "student" | "teacher"
}
```

### POST /api/auth/login
Login a user
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

### GET /api/auth/me
Restore the current authenticated user

Send the JWT in the `Authorization` header:
```http
Authorization: Bearer <token>
```

## Environment Variables
Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vi-slides
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## Troubleshooting
- **"Cannot find module"**: Run `npm install` again
- **MongoDB connection error**: Check if MongoDB is running
- **Frontend can't reach API**: Make sure backend is running on port 5000 and CORS is enabled
