// Import required modules
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept images and videos only
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// Global variable for model
let model = null;

// Load TensorFlow model on startup
async function loadModel() {
    try {
        console.log('Loading TensorFlow model...');
        
        // Path to model
        const modelPath = path.join(__dirname, '../model/model.json');
        
        // Check if model exists
        if (fs.existsSync(modelPath)) {
            model = await tf.loadLayersModel(`file://${modelPath}`);
            console.log('Model loaded successfully');
        } else {
            console.log('Model file not found. Creating a simple placeholder model...');
            // Create a simple placeholder model for demonstration
            model = createPlaceholderModel();
            console.log('Placeholder model created');
        }
    } catch (error) {
        console.error('Error loading model:', error);
        console.log('Creating placeholder model as fallback...');
        model = createPlaceholderModel();
    }
}

// Create a simple placeholder model for demonstration
function createPlaceholderModel() {
    // Simple sequential model that accepts 224x224x3 images
    const inputShape = [224, 224, 3];
    
    const placeholderModel = tf.sequential({
        layers: [
            tf.layers.flatten({ inputShape: inputShape }),
            tf.layers.dense({ units: 128, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.5 }),
            tf.layers.dense({ units: 64, activation: 'relu' }),
            tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
    });
    
    placeholderModel.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });
    
    return placeholderModel;
}

// Preprocess image for model input
async function preprocessImage(imagePath) {
    try {
        // Resize image to 224x224 and convert to RGB
        const imageBuffer = await sharp(imagePath)
            .resize(224, 224)
            .removeAlpha()
            .raw()
            .toBuffer();
        
        // Convert buffer to tensor
        const tensor = tf.tensor3d(new Uint8Array(imageBuffer), [224, 224, 3]);
        
        // Normalize pixel values to 0-1 range
        const normalized = tensor.div(255.0);
        
        // Add batch dimension
        const batched = normalized.expandDims(0);
        
        return batched;
    } catch (error) {
        console.error('Error preprocessing image:', error);
        throw error;
    }
}

// Predict if image is fake or real
async function predictImage(imagePath) {
    try {
        // Preprocess the image
        const inputTensor = await preprocessImage(imagePath);
        
        // Make prediction
        const prediction = await model.predict(inputTensor);
        
        // Get confidence value (between 0 and 1)
        const confidenceValue = await prediction.data();
        const confidence = confidenceValue[0];
        
        // Determine label based on confidence threshold
        // If confidence > 0.5, it's "Fake", otherwise "Real"
        const label = confidence > 0.5 ? 'Fake' : 'Real';
        
        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();
        
        return {
            label: label,
            confidence: parseFloat(confidence.toFixed(4))
        };
    } catch (error) {
        console.error('Error during prediction:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        modelLoaded: model !== null,
        timestamp: new Date().toISOString()
    });
});

// Prediction endpoint
app.post('/predict', upload.single('file'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log(`Processing file: ${req.file.originalname}`);
        
        // Check if model is loaded
        if (!model) {
            return res.status(500).json({ error: 'Model not loaded' });
        }
        
        // Get file path
        const filePath = req.file.path;
        
        // For video files, we would extract first frame
        // For simplicity, treating videos as images in this implementation
        // In production, use ffmpeg to extract frame
        
        // Make prediction
        const result = await predictImage(filePath);
        
        console.log(`Prediction result: ${result.label} with confidence ${result.confidence}`);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        // Return result
        res.json(result);
        
    } catch (error) {
        console.error('Prediction error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Prediction failed',
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Max 50MB allowed.' });
        }
        return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
    try {
        // Load model first
        await loadModel();
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`TrustLens backend server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Prediction endpoint: http://localhost:${PORT}/predict`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
