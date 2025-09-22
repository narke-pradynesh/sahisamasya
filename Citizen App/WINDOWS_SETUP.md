# Windows 11 Setup Guide for SahiSamasya

##  Windows-Specific Setup

Since Windows 11 doesn't support `&&` in command chaining, we've created Windows-compatible scripts.

### Quick Setup (Recommended)

**Option 1: Batch Script**
```cmd
npm run setup:windows
```

**Option 2: PowerShell Script**
```powershell
npm run setup:windows-ps
```

**Option 3: Manual Setup**
```cmd
npm install
npm run install:multer
mkdir uploads
```

### Starting the Application

**Start both frontend and backend:**
```cmd
npm run dev:full
```

**Start with network access (for mobile testing):**
```cmd
npm run dev:network
```

### Individual Commands

**Start only the frontend:**
```cmd
npm run dev
```

**Start only the backend:**
```cmd
npm run server
```

**Start backend with network access:**
```cmd
npm run server:host
```

## 🔧 Troubleshooting

### PowerShell Execution Policy Error
If you get a PowerShell execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If port 3000 is already in use:
1. Kill the process using port 3000:
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```
2. Or change the port in `server/index.js`

### File Upload Issues
1. Ensure the `uploads` directory exists
2. Check that multer is installed: `npm list multer`
3. Verify server is running on port 3000

### Upvote Issues
1. Check server console for detailed error logs
2. Ensure MongoDB is running
3. Verify authentication token is valid

## 📁 Directory Structure
```
sahisamasya-mobile/
├── server/
│   ├── routes/
│   │   ├── upload.js      # File upload handling
│   │   ├── upvotes.js     # Upvote management
│   │   └── ...
│   └── index.js           # Server entry point
├── uploads/               # Uploaded files (created automatically)
├── scripts/
│   ├── setup-windows.bat  # Windows batch setup
│   └── setup-windows.ps1  # PowerShell setup
└── ...
```

##  Features Fixed

###  Upvote System
- Fixed 500 error when deleting upvotes
- Added detailed logging for debugging
- Improved error handling and validation

###  File Upload System
- Real server-side file upload (not just data URLs)
- Proper file storage in `uploads/` directory
- Fallback to data URL if server upload fails
- File serving endpoint for uploaded images

###  Windows Compatibility
- Cross-platform scripts using `concurrently`
- Windows-specific setup scripts
- PowerShell and batch file options
- No more `&&` command chaining issues

##  Testing the Fixes

1. **Test Upvote Deletion:**
   - Login to the app
   - Upvote a complaint
   - Try to remove the upvote
   - Check server console for detailed logs

2. **Test File Upload:**
   - Go to "Report Issue"
   - Upload an image file
   - Check if it appears in the `uploads/` directory
   - Verify the image displays correctly

3. **Test Windows Scripts:**
   - Run `npm run setup:windows`
   - Verify all dependencies are installed
   - Start the app with `npm run dev:full`

##  Support

If you encounter any issues:
1. Check the server console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check that ports 3000 and 5173 are available
