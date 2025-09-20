# MongoDB Integration Setup Guide

## 🚀 **MongoDB Integration Complete!**

Your SahiSamasya platform now uses MongoDB instead of browser localStorage for data persistence.

## 📋 **What's Been Added**

### **Backend Server (Node.js + Express + MongoDB)**
- **MongoDB Connection**: Connected to your MongoDB Atlas cluster
- **Authentication**: JWT-based user authentication
- **API Endpoints**: RESTful API for all operations
- **Data Models**: Mongoose schemas for User, Complaint, and Upvote
- **Security**: Password hashing, input validation, CORS protection

### **Frontend Updates**
- **API Integration**: All entities now use MongoDB backend
- **Authentication**: JWT token management
- **Error Handling**: Graceful fallbacks to demo data
- **Real-time Updates**: Live data from MongoDB

## 🛠️ **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start the Backend Server**
```bash
# Start MongoDB backend server
npm run server

# Or start both frontend and backend together
npm run dev:full
```

### **3. Start the Frontend (in another terminal)**
```bash
npm run dev
```

## 🗄️ **Database Structure**

### **MongoDB Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  full_name: String,
  email: String (unique),
  password: String (hashed),
  role: String (citizen/admin),
  is_active: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

#### **Complaints Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  photo_url: String,
  latitude: Number,
  longitude: Number,
  address: String,
  category: String,
  status: String,
  priority: String,
  upvote_count: Number,
  escalation_threshold: Number,
  assigned_to: String,
  resolution_notes: String,
  estimated_completion: Date,
  created_by: ObjectId (ref: User),
  created_at: Date,
  updated_at: Date
}
```

#### **Upvotes Collection**
```javascript
{
  _id: ObjectId,
  complaint_id: ObjectId (ref: Complaint),
  user_email: String,
  created_at: Date
}
```

## 🔗 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### **Complaints**
- `GET /api/complaints` - Get all complaints (with pagination/filters)
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create new complaint (auth required)
- `PUT /api/complaints/:id` - Update complaint (admin only)
- `DELETE /api/complaints/:id` - Delete complaint (admin only)

### **Upvotes**
- `GET /api/upvotes` - Get all upvotes
- `GET /api/upvotes/complaint/:id` - Get upvotes for complaint
- `POST /api/upvotes` - Create upvote (auth required)
- `DELETE /api/upvotes/:id` - Remove upvote (auth required)
- `GET /api/upvotes/check/:id` - Check if user upvoted (auth required)

## 🔐 **Authentication Flow**

1. **Registration/Login**: User provides credentials
2. **JWT Token**: Server returns JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **API Requests**: Token sent in Authorization header
5. **Token Validation**: Server validates token on each request

## 📊 **Data Migration**

### **From localStorage to MongoDB**
- **Users**: Stored in MongoDB with hashed passwords
- **Complaints**: Stored in MongoDB with user references
- **Upvotes**: Stored in MongoDB with proper relationships

### **Demo Data Seeding**
```javascript
// Run in browser console to seed demo data
import { seedDemoData } from './src/utils/demoData.js';
seedDemoData();
```

## 🧪 **Testing the Integration**

### **1. Test User Registration**
```javascript
// In browser console
const user = await User.register({
  full_name: "Test User",
  email: "test@example.com",
  password: "password123"
});
console.log(user);
```

### **2. Test User Login**
```javascript
const login = await User.login("test@example.com", "password123");
console.log(login);
```

### **3. Test Complaint Creation**
```javascript
const complaint = await Complaint.create({
  title: "Test Issue",
  description: "This is a test complaint",
  photo_url: "https://example.com/photo.jpg",
  latitude: 40.7128,
  longitude: -74.0060,
  address: "Test Address",
  category: "other"
});
console.log(complaint);
```

### **4. Test Upvote**
```javascript
const upvote = await Upvote.create({
  complaint_id: "COMPLAINT_ID_HERE"
});
console.log(upvote);
```

## 🔧 **Configuration**

### **MongoDB Connection**
- **Connection String**: `mongodb+srv://admin:mzh8441@civic-platform.4xmfl4f.mongodb.net/`
- **Database Name**: `SahiSamasya`
- **Connection**: Configured in `server/config/database.js`

### **JWT Configuration**
- **Secret**: `your-super-secret-jwt-key-change-this-in-production`
- **Expiry**: 7 days
- **Algorithm**: HS256

### **Server Configuration**
- **Port**: 3001
- **CORS**: Enabled for `http://localhost:5173`
- **Body Limit**: 10MB

## 🚨 **Security Features**

### **Password Security**
- **Hashing**: bcrypt with salt rounds 12
- **Validation**: Minimum 6 characters
- **Storage**: Never stored in plain text

### **JWT Security**
- **Expiration**: 7 days
- **Validation**: Server-side token verification
- **Storage**: localStorage (consider httpOnly cookies for production)

### **Input Validation**
- **Mongoose Schemas**: Built-in validation
- **Sanitization**: Trim whitespace, lowercase emails
- **Type Checking**: Strict data types

## 📈 **Performance Features**

### **Database Indexes**
- **Users**: Email index for fast lookups
- **Complaints**: Created date, status, category indexes
- **Upvotes**: Compound index on complaint_id + user_email

### **Pagination**
- **Complaints**: Limit and page parameters
- **Efficient Queries**: Skip and limit for large datasets

### **Caching**
- **Frontend**: localStorage for user data
- **Token Validation**: Cached user verification

## 🐛 **Troubleshooting**

### **Connection Issues**
```bash
# Check if MongoDB server is running
curl http://localhost:3001/health

# Check MongoDB connection
# Look for "MongoDB Connected" in server logs
```

### **Authentication Issues**
```javascript
// Check stored token
console.log(localStorage.getItem('SahiSamasya_token'));

// Clear authentication data
User.clearStoredData();
```

### **API Issues**
```javascript
// Test API connectivity
fetch('http://localhost:3001/api/health')
  .then(res => res.json())
  .then(console.log);
```

## 🚀 **Production Deployment**

### **Environment Variables**
```bash
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### **Security Checklist**
- [ ] Change JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Use environment variables
- [ ] Set up monitoring and logging

## 🎯 **Next Steps**

1. **Deploy Backend**: Deploy to Heroku, Vercel, or AWS
2. **Update Frontend**: Point to production API URL
3. **Add Features**: Email verification, password reset
4. **Monitoring**: Add logging and error tracking
5. **Scaling**: Consider Redis for session management

Your SahiSamasya platform is now fully integrated with MongoDB! 🎉
