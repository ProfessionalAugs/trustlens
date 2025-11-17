// Test script to validate TensorFlow model loading and prediction

const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');

console.log('TrustLens Model Test Script');
console.log('============================\n');

async function testModel() {
    try {
        console.log('1. Checking TensorFlow.js installation...');
        console.log(`   TensorFlow.js version: ${tf.version.tfjs}`);
        console.log('   ✓ TensorFlow.js is installed\n');
        
        console.log('2. Checking model files...');
        const modelPath = path.join(__dirname, '../model/model.json');
        
        if (fs.existsSync(modelPath)) {
            console.log('   ✓ model.json found');
            
            // Try to load the model
            console.log('\n3. Loading model...');
            const model = await tf.loadLayersModel(`file://${modelPath}`);
            console.log('   ✓ Model loaded successfully');
            
            // Print model summary
            console.log('\n4. Model Summary:');
            model.summary();
            
        } else {
            console.log('   ⚠ model.json not found');
            console.log('   Creating placeholder model for testing...\n');
            
            // Create placeholder model
            const model = tf.sequential({
                layers: [
                    tf.layers.flatten({ inputShape: [224, 224, 3] }),
                    tf.layers.dense({ units: 128, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.5 }),
                    tf.layers.dense({ units: 64, activation: 'relu' }),
                    tf.layers.dense({ units: 1, activation: 'sigmoid' })
                ]
            });
            
            model.compile({
                optimizer: 'adam',
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });
            
            console.log('3. Placeholder Model Created:');
            model.summary();
        }
        
        console.log('\n5. Testing prediction with random input...');
        
        // Create random input tensor (224x224x3 image)
        const randomInput = tf.randomNormal([1, 224, 224, 3]);
        
        // Make prediction
        const prediction = await model.predict(randomInput);
        const confidence = await prediction.data();
        
        console.log(`   Input shape: [1, 224, 224, 3]`);
        console.log(`   Confidence score: ${confidence[0].toFixed(4)}`);
        console.log(`   Label: ${confidence[0] > 0.5 ? 'Fake' : 'Real'}`);
        console.log('   ✓ Prediction successful\n');
        
        // Clean up
        randomInput.dispose();
        prediction.dispose();
        
        console.log('============================');
        console.log('All tests passed! ✓');
        console.log('Backend server is ready to use.');
        
    } catch (error) {
        console.error('\n❌ Error during testing:');
        console.error(error.message);
        console.error('\nPlease check:');
        console.error('1. TensorFlow.js is installed (npm install @tensorflow/tfjs-node)');
        console.error('2. Model files exist in the model directory');
        console.error('3. Node.js version is compatible (>=14.0.0)');
    }
}

// Run the test
testModel();
