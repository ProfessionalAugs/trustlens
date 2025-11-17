// Import Firebase modules
import { auth } from '../firebase/firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

// Get DOM elements
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const loadingOverlay = document.getElementById('loadingOverlay');

// Tab switching functionality
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginError.textContent = '';
    signupError.textContent = '';
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    loginError.textContent = '';
    signupError.textContent = '';
});

// Login form submission
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Clear previous errors
    loginError.textContent = '';
    
    // Validate inputs
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }
    
    // Show loading overlay
    loadingOverlay.classList.remove('hidden');
    
    try {
        // Sign in user with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user.email);
        
        // Redirect to dashboard (handled by onAuthStateChanged)
    } catch (error) {
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        
        // Handle specific error codes
        console.error('Login error:', error.code, error.message);
        
        switch (error.code) {
            case 'auth/invalid-email':
                loginError.textContent = 'Invalid email address format';
                break;
            case 'auth/user-not-found':
                loginError.textContent = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                loginError.textContent = 'Incorrect password';
                break;
            case 'auth/invalid-credential':
                loginError.textContent = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                loginError.textContent = 'Too many failed attempts. Try again later';
                break;
            default:
                loginError.textContent = 'Login failed. Please try again';
        }
    }
});

// Sign up form submission
signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    
    // Clear previous errors
    signupError.textContent = '';
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
        signupError.textContent = 'Please fill in all fields';
        return;
    }
    
    // Check password length
    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        return;
    }
    
    // Show loading overlay
    loadingOverlay.classList.remove('hidden');
    
    try {
        // Create user with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.email);
        
        // Redirect to dashboard (handled by onAuthStateChanged)
    } catch (error) {
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        
        // Handle specific error codes
        console.error('Signup error:', error.code, error.message);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                signupError.textContent = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                signupError.textContent = 'Invalid email address format';
                break;
            case 'auth/weak-password':
                signupError.textContent = 'Password is too weak. Use at least 6 characters';
                break;
            case 'auth/network-request-failed':
                signupError.textContent = 'Network error. Check your connection';
                break;
            default:
                signupError.textContent = 'Sign up failed. Please try again';
        }
    }
});
