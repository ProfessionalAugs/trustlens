TrustLens - Deepfake Detection System

PROJECT OVERVIEW

TrustLens is a comprehensive deepfake detection web application and Chrome extension that uses TensorFlow to analyze images and videos for authenticity. Users can upload media files and receive instant detection results with confidence scores and visual heatmaps.

FEATURES

- Firebase Authentication (Email/Password)
- Image and Video Upload Detection
- Real-time TensorFlow Model Analysis
- Confidence Score Visualization
- Simulated Heatmap Overlay for Images
- Firestore Database Integration
- Admin Dashboard for Low Confidence Results
- Chrome Extension for Webpage Video Scanning
- Modern Dark Theme UI

TECHNOLOGY STACK

Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express
ML Model: TensorFlow.js
Database: Firebase Firestore
Authentication: Firebase Auth
Extension: Chrome Manifest v3

COLOR PALETTE

Primary: #802BB1
Background: #2D283E
Accent 1: #564F6F
Accent 2: #4C495D
Text: #D1D7E0

INSTALLATION INSTRUCTIONS

STEP 1: PREREQUISITES

Install Node.js (version 14 or higher)
Install npm (comes with Node.js)
Create a Firebase project at https://console.firebase.google.com
Chrome browser (for extension testing)

STEP 2: FIREBASE SETUP

1. Go to Firebase Console and create a new project
2. Enable Email/Password authentication in Authentication section
3. Create a Firestore Database in test mode
4. Go to Project Settings and copy your Firebase config
5. Open firebase/firebaseConfig.js and replace placeholder values with your actual config
6. Create an admin user with email: admin@example.com

STEP 3: FIRESTORE RULES

Go to Firestore Database > Rules and paste the rules from firebase/firestoreRules.txt

STEP 4: BACKEND SETUP

1. Open terminal and navigate to the backend folder:
   cd backend

2. Install dependencies:
   npm install

3. Start the server:
   node server.js

4. Server will run on http://localhost:3000

STEP 5: FRONTEND SETUP

1. Open frontend/index.html in your browser for login page
2. Or use a local server:
   - Install Live Server extension in VS Code
   - Right click index.html and select "Open with Live Server"
   - Or use Python: python -m http.server 8080

STEP 6: CHROME EXTENSION SETUP

1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" in top right
3. Click "Load unpacked"
4. Select the chrome-extension folder
5. Extension icon will appear in toolbar
6. Pin it for easy access

USAGE GUIDE

WEB APPLICATION

1. Open the application in your browser
2. Sign up with email and password
3. Login to access the dashboard
4. Upload an image or video file
5. Wait for analysis (takes 2-5 seconds)
6. View results with confidence score and heatmap
7. All results are automatically saved to your history

ADMIN DASHBOARD

1. Login with admin@example.com
2. Navigate to /admin.html
3. View all predictions with confidence below 0.5
4. Review flagged content for quality control

CHROME EXTENSION

1. Click the TrustLens extension icon
2. Extension will scan for video elements on current page
3. Click "Scan Video" button
4. First frame is captured and analyzed
5. Results appear in popup within seconds

PROJECT STRUCTURE

trustlens/
├── frontend/
│   ├── index.html (Login/Signup page)
│   ├── dashboard.html (Main upload interface)
│   ├── admin.html (Admin review panel)
│   ├── styles.css (Global styles)
│   ├── auth.js (Authentication logic)
│   ├── dashboard.js (Upload and detection logic)
│   └── admin.js (Admin panel logic)
├── backend/
│   ├── server.js (Express server with API routes)
│   ├── package.json (Dependencies)
│   └── package-lock.json (Auto-generated)
├── firebase/
│   ├── firebaseConfig.js (Firebase initialization)
│   └── firestoreRules.txt (Database security rules)
├── model/
│   ├── model.json (TensorFlow model architecture)
│   └── weights.bin (Model weights placeholder)
├── chrome-extension/
│   ├── manifest.json (Extension configuration)
│   ├── popup.html (Extension UI)
│   ├── popup.js (Extension logic)
│   ├── content.js (Webpage video capture)
│   ├── popup.css (Extension styles)
│   └── icon.png (Extension icon)
├── scripts/
│   └── testModel.js (Model testing script)
└── README.md (This file)

API ENDPOINTS

POST /predict
- Accepts: multipart/form-data with image or video file
- Returns: { label: "Fake" or "Real", confidence: 0.0-1.0 }

GET /health
- Returns: { status: "ok" }

DETECTION LOGIC

1. File is uploaded to backend via FormData
2. Image is resized to 224x224 pixels
3. Pixel values are normalized to 0-1 range
4. TensorFlow model processes the image tensor
5. Model outputs probability score
6. If confidence > 0.5: Label as "Fake"
7. If confidence <= 0.5: Label as "Real"
8. Result sent back to frontend with confidence percentage
9. Frontend displays result with visual heatmap overlay
10. Result saved to Firestore with user ID and timestamp

FIRESTORE SCHEMA

Collection: predictions
Document fields:
- userId: string (Firebase user ID)
- label: string ("Fake" or "Real")
- confidence: number (0.0 to 1.0)
- timestamp: timestamp (auto-generated)
- fileName: string (original file name)

TROUBLESHOOTING

FIREBASE CONNECTION ISSUES
- Verify firebaseConfig.js has correct credentials
- Check Firebase project is active
- Ensure Firestore is created and rules are set

BACKEND WON'T START
- Run npm install in backend folder
- Check port 3000 is not in use
- Verify Node.js version is 14+

MODEL LOADING ERRORS
- Ensure model/model.json exists
- Check TensorFlow.js is installed
- Verify model path in server.js

EXTENSION NOT WORKING
- Reload extension in chrome://extensions
- Check backend server is running
- Open browser console for error messages

CORS ERRORS
- Backend has CORS enabled for all origins
- If issues persist, check browser console

SECURITY NOTES

- Never commit real Firebase credentials to version control
- Use environment variables for production
- Update Firestore rules for production deployment
- Implement rate limiting for API in production
- Validate file types and sizes on backend

FUTURE ENHANCEMENTS

- Real-time video stream analysis
- Multiple frame sampling for videos
- User history dashboard
- Batch upload processing
- Advanced heatmap visualization
- Export results as PDF reports
- Mobile app version
- API key authentication

CREDITS

Developed as a deepfake detection solution for academic and research purposes.
Uses TensorFlow.js for in-browser machine learning.
Built with Firebase for authentication and database.

LICENSE

This project is for educational purposes.

CONTACT

For issues or questions, check the troubleshooting section or review Firebase and TensorFlow documentation.
