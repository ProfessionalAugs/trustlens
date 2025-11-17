TRUSTLENS QUICK START GUIDE

Follow these simple steps to get TrustLens running on your system:

STEP 1: INSTALL NODE.JS
Download and install Node.js from https://nodejs.org
This includes npm which you need for the backend

STEP 2: SETUP FIREBASE
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Email/Password authentication
4. Create Firestore database
5. Copy your Firebase config from Project Settings
6. Open firebase/firebaseConfig.js and paste your config

STEP 3: SETUP FIRESTORE RULES
1. In Firebase Console, go to Firestore Database
2. Click Rules tab
3. Copy content from firebase/firestoreRules.txt
4. Paste and publish the rules

STEP 4: START BACKEND SERVER
1. Open terminal in the backend folder
2. Run: npm install
3. Wait for all packages to install
4. Run: node server.js
5. Server will start on http://localhost:3000

STEP 5: OPEN WEB APPLICATION
1. Open frontend/index.html in your browser
OR
2. Use a local server like Live Server in VS Code
3. Sign up with a new account
4. Login and start using the app

STEP 6: INSTALL CHROME EXTENSION
1. Open Chrome browser
2. Go to chrome://extensions/
3. Turn on Developer mode
4. Click Load unpacked
5. Select the chrome-extension folder
6. Extension icon will appear in toolbar

COMMON ISSUES:

Backend won't start
- Make sure you ran npm install
- Check if port 3000 is available
- Try running: npm install --force

Firebase errors
- Verify your config is correct
- Check Firebase project is active
- Make sure authentication is enabled

Extension not working
- Reload the extension
- Make sure backend is running
- Check browser console for errors

TESTING THE SYSTEM:

1. Login to the web app
2. Upload any image file
3. Click Analyze
4. View the detection result
5. Check if it saves to Firestore

For the extension:
1. Go to any page with a video (YouTube, etc)
2. Click the TrustLens extension icon
3. Click Scan Video
4. View the detection result

ADMIN ACCESS:

To access admin dashboard:
1. Create account with email: admin@example.com
2. Login with this account
3. Go to dashboard and click Admin link
4. View all low confidence predictions

That's it! You're ready to use TrustLens!

For detailed information, see README.md
