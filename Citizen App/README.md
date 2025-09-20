# SahiSamasya Setup Guide

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Seed demo data (optional):**
   Open browser console and run:
   ```javascript
   import { seedDemoData } from './src/utils/demoData.js';
   seedDemoData();
   ```

## 🔐 Authentication Features

### **User Registration**
- Full name, email, and password validation
- Password strength requirements
- Email format validation
- Auto-login after successful registration

### **User Login**
- Email and password authentication
- Remember user session
- Secure logout functionality

### **Demo Accounts**
- **Admin:** `admin@SahiSamasya.com` (any password 6+ chars)
- **Citizen:** `citizen@SahiSamasya.com` (any password 6+ chars)
- **User:** `jane@example.com` (any password 6+ chars)

## 📸 Photo Upload Features

### **Enhanced Photo Upload**
- **File validation:** Only image files (JPG, PNG, GIF)
- **Size limit:** Maximum 10MB
- **Preview:** Real-time image preview with hover controls
- **Error handling:** Clear error messages for invalid files
- **AI Integration:** Auto-classification of issues (when available)

### **Photo Preview**
- High-quality image display
- Hover controls for changing/removing photos
- Error handling for failed image loads
- Responsive design

## 🏗️ Architecture

### **Authentication System**
- Local storage-based session management
- User entity with registration/login methods
- Authentication context for state management
- Secure logout with data cleanup

### **File Upload System**
- FileReader API for client-side processing
- Data URL generation for immediate preview
- Validation and error handling
- Ready for cloud storage integration

### **API Integration**
- Base44 API endpoints configured
- Fallback to demo data when API unavailable
- Error handling and retry logic
- User-specific API key management

## 🧪 Testing

### **Test Authentication**
1. Click "Create Account" to register
2. Use demo accounts to test login
3. Test logout functionality

### **Test Photo Upload**
1. Go to "Report Issue"
2. Click photo upload area
3. Select an image file
4. Verify preview and validation

### **Test API Integration**
```javascript
import { testApiIntegration } from './src/utils/apiTest.js';
testApiIntegration();
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory with the following variables:

```env
# OpenRouter API Configuration
# Get your API key from: https://openrouter.ai/keys
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (if needed)
MONGODB_URI=mongodb://localhost:27017/sahisamasya
```

### **OpenRouter API Setup**
1. Visit [OpenRouter](https://openrouter.ai/keys) to get your API key
2. Add the key to your `.env` file as `VITE_OPENROUTER_API_KEY`
3. The app will use `meta-llama/llama-4-maverick:free` model for image classification

### **AI Image Classification**
The system automatically classifies uploaded images into these categories:
- **garbage** - Waste management issues
- **public works** - Infrastructure maintenance
- **electricity** - Power-related problems
- **gas** - Gas utility issues
- **public transport** - Transportation problems
- **garden** - Landscaping and green spaces
- **drainage department** - Water drainage issues

If an image doesn't match any category, it returns `null` for manual classification.

### **API Settings**
- Base URL: `https://app.base44.com/api/apps/68ccfbb81d46a4f46a63c627`
- API Key: `152ccf803de8447b8aa536565ca84f77`
- Configure in `src/config/api.js`

### **File Upload Settings**
- Max file size: 10MB
- Allowed types: image/*
- Configure in `src/integrations/Core.js`

## 📱 Features

### **User Management**
- ✅ User registration with email
- ✅ User login with email/password
- ✅ Session persistence
- ✅ Secure logout
- ✅ Role-based access (admin/citizen)

### **Photo Upload**
- ✅ File validation
- ✅ Size limits
- ✅ Real-time preview
- ✅ Error handling
- ✅ Hover controls
- ✅ AI classification with OpenRouter API

### **API Integration**
- ✅ Base44 API endpoints
- ✅ Error handling
- ✅ Fallback data
- ✅ User-specific keys

## 🎯 Next Steps

1. **Deploy to production**
2. **Integrate real cloud storage** for photos
3. **Add real AI service** for classification
4. **Implement email verification**
5. **Add password reset functionality**
6. **Integrate with real authentication provider**

## 🐛 Troubleshooting

### **Login Issues**
- Check browser console for errors
- Clear localStorage and try again
- Use demo accounts for testing

### **Photo Upload Issues**
- Ensure file is under 10MB
- Check file type is image/*
- Clear browser cache if needed

### **API Issues**
- Check network connection
- Verify API key is correct
- App will fallback to demo data automatically
