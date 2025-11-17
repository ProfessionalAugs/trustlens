// Import Firebase modules
import { auth, db } from '../firebase/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Backend API URL
const API_URL = 'http://localhost:3000';

// Global variables
let currentUser = null;
let selectedFile = null;

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('userEmail').textContent = user.email;
        
        // Check if user is admin
        if (user.email === 'admin@example.com') {
            const adminHint = document.getElementById('adminHint');
            adminHint.innerHTML = '<a href="admin.html">Access Admin Dashboard</a>';
        }
    } else {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Get DOM elements
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadBox = document.getElementById('uploadBox');
const filePreview = document.getElementById('filePreview');
const previewImage = document.getElementById('previewImage');
const previewVideo = document.getElementById('previewVideo');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');

// Select file button
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

// Upload box click
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Drag and drop functionality
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#802BB1';
    uploadBox.style.backgroundColor = 'rgba(128, 43, 177, 0.1)';
});

uploadBox.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#564F6F';
    uploadBox.style.backgroundColor = 'transparent';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#564F6F';
    uploadBox.style.backgroundColor = 'transparent';
    
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Handle file selection
function handleFileSelect(file) {
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        alert('Please select a valid image or video file');
        return;
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
    }
    
    selectedFile = file;
    
    // Show preview
    fileName.textContent = file.name;
    
    if (validImageTypes.includes(file.type)) {
        // Image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
            previewVideo.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        // Video preview
        const videoURL = URL.createObjectURL(file);
        previewVideo.src = videoURL;
        previewVideo.classList.remove('hidden');
        previewImage.classList.add('hidden');
    }
    
    // Show preview section and hide upload box
    uploadBox.classList.add('hidden');
    filePreview.classList.remove('hidden');
}

// Cancel button
cancelBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    previewVideo.src = '';
    uploadBox.classList.remove('hidden');
    filePreview.classList.add('hidden');
    resultsSection.classList.add('hidden');
});

// Analyze button
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }
    
    // Show loading overlay
    loadingOverlay.classList.remove('hidden');
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Send to backend API
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const result = await response.json();
        
        // Save to Firestore
        await saveToFirestore(result);
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again.');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
});

// Save prediction to Firestore
async function saveToFirestore(result) {
    try {
        await addDoc(collection(db, 'predictions'), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            label: result.label,
            confidence: result.confidence,
            fileName: selectedFile.name,
            timestamp: serverTimestamp()
        });
        console.log('Prediction saved to Firestore');
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
}

// Display results
function displayResults(result) {
    // Hide upload section
    document.querySelector('.upload-section').classList.add('hidden');
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Set label
    const resultLabel = document.getElementById('resultLabel');
    resultLabel.textContent = result.label;
    resultLabel.className = 'result-label ' + result.label.toLowerCase();
    
    // Set confidence badge
    const confidenceBadge = document.getElementById('confidenceBadge');
    const confidencePercent = (result.confidence * 100).toFixed(1);
    confidenceBadge.textContent = confidencePercent + '%';
    
    // Set confidence bar
    const confidenceFill = document.getElementById('confidenceFill');
    confidenceFill.style.width = (100 - result.confidence * 100) + '%';
    
    // Set confidence text
    const confidenceText = document.getElementById('confidenceText');
    confidenceText.textContent = `Confidence Score: ${confidencePercent}%`;
    
    // Display media
    const resultImage = document.getElementById('resultImage');
    const resultVideo = document.getElementById('resultVideo');
    const heatmapCanvas = document.getElementById('heatmapCanvas');
    
    if (selectedFile.type.startsWith('image/')) {
        // Show image with heatmap
        const reader = new FileReader();
        reader.onload = (e) => {
            resultImage.src = e.target.result;
            resultImage.classList.remove('hidden');
            resultVideo.classList.add('hidden');
            
            // Generate heatmap for images
            generateHeatmap(resultImage, heatmapCanvas, result.confidence);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        // Show video
        const videoURL = URL.createObjectURL(selectedFile);
        resultVideo.src = videoURL;
        resultVideo.classList.remove('hidden');
        resultImage.classList.add('hidden');
        heatmapCanvas.classList.add('hidden');
    }
    
    // Set result details
    document.getElementById('resultFileName').textContent = selectedFile.name;
    document.getElementById('resultTime').textContent = new Date().toLocaleString();
}

// Generate simulated heatmap overlay
function generateHeatmap(image, canvas, confidence) {
    // Wait for image to load
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.classList.remove('hidden');
        
        const ctx = canvas.getContext('2d');
        
        // Create grid-based heatmap
        const gridSize = 20;
        const cols = Math.ceil(canvas.width / gridSize);
        const rows = Math.ceil(canvas.height / gridSize);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Generate random intensity based on confidence
                const baseIntensity = confidence;
                const randomVariation = (Math.random() - 0.5) * 0.3;
                const intensity = Math.max(0, Math.min(1, baseIntensity + randomVariation));
                
                // Color based on intensity
                const red = Math.floor(255 * intensity);
                const green = Math.floor(255 * (1 - intensity));
                const blue = 0;
                const alpha = intensity * 0.4;
                
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
            }
        }
    };
}

// New analysis button
newAnalysisBtn.addEventListener('click', () => {
    // Reset everything
    selectedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    previewVideo.src = '';
    
    // Show upload section
    document.querySelector('.upload-section').classList.remove('hidden');
    uploadBox.classList.remove('hidden');
    filePreview.classList.add('hidden');
    resultsSection.classList.add('hidden');
});
