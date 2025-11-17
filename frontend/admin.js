// Import Firebase modules
import { auth, db } from '../firebase/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global variables
let allPredictions = [];
let filteredPredictions = [];
let currentFilter = 'all';

// Check authentication and admin access
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin
        if (user.email !== 'admin@example.com') {
            alert('Access denied. Admin only.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Load predictions
        loadPredictions();
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

// Load predictions with confidence below 0.5
async function loadPredictions() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    
    try {
        // Query Firestore for predictions with confidence < 0.5
        const predictionsRef = collection(db, 'predictions');
        const q = query(
            predictionsRef,
            where('confidence', '<', 0.5),
            orderBy('confidence', 'asc'),
            orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        allPredictions = [];
        querySnapshot.forEach((doc) => {
            allPredictions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Display predictions
        filteredPredictions = allPredictions;
        displayPredictions();
        updateStats();
        
    } catch (error) {
        console.error('Error loading predictions:', error);
        
        // Show error in table
        const tableBody = document.getElementById('predictionsTable');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">Error loading predictions. Check console for details.</td>
            </tr>
        `;
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

// Display predictions in table
function displayPredictions() {
    const tableBody = document.getElementById('predictionsTable');
    const noResults = document.getElementById('noResults');
    
    if (filteredPredictions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No predictions found</td></tr>';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Build table rows
    let html = '';
    filteredPredictions.forEach(prediction => {
        const timestamp = prediction.timestamp ? 
            new Date(prediction.timestamp.toDate()).toLocaleString() : 
            'N/A';
        
        const confidencePercent = (prediction.confidence * 100).toFixed(1);
        const statusClass = prediction.label === 'Fake' ? 'danger' : 'success';
        
        html += `
            <tr>
                <td>${timestamp}</td>
                <td>${prediction.userEmail || prediction.userId}</td>
                <td>${prediction.fileName || 'Unknown'}</td>
                <td><span style="color: ${prediction.label === 'Fake' ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">${prediction.label}</span></td>
                <td>${confidencePercent}%</td>
                <td><span style="color: var(--warning); font-weight: 600;">Flagged</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update statistics
function updateStats() {
    const totalCount = document.getElementById('totalCount');
    const avgConfidence = document.getElementById('avgConfidence');
    
    totalCount.textContent = filteredPredictions.length;
    
    if (filteredPredictions.length > 0) {
        const sum = filteredPredictions.reduce((acc, pred) => acc + pred.confidence, 0);
        const avg = (sum / filteredPredictions.length * 100).toFixed(1);
        avgConfidence.textContent = avg + '%';
    } else {
        avgConfidence.textContent = '0%';
    }
}

// Filter buttons
document.getElementById('filterAll').addEventListener('click', () => {
    currentFilter = 'all';
    updateFilterButtons('filterAll');
    filteredPredictions = allPredictions;
    displayPredictions();
    updateStats();
});

document.getElementById('filterFake').addEventListener('click', () => {
    currentFilter = 'fake';
    updateFilterButtons('filterFake');
    filteredPredictions = allPredictions.filter(pred => pred.label === 'Fake');
    displayPredictions();
    updateStats();
});

document.getElementById('filterReal').addEventListener('click', () => {
    currentFilter = 'real';
    updateFilterButtons('filterReal');
    filteredPredictions = allPredictions.filter(pred => pred.label === 'Real');
    displayPredictions();
    updateStats();
});

// Update active filter button
function updateFilterButtons(activeId) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}
