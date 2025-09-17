// DOM Elements
const reportForm = document.getElementById('reportForm');
const categorySelect = document.getElementById('category');
const descriptionTextarea = document.getElementById('description');
const charCount = document.getElementById('charCount');
const photoUpload = document.getElementById('photoUpload');
const photoInput = document.getElementById('photoInput');
const uploadedPhotos = document.getElementById('uploadedPhotos');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const recordingControls = document.getElementById('recordingControls');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTimer = document.getElementById('recordingTimer');
const micIcon = document.getElementById('micIcon');
const audioPlayback = document.getElementById('audioPlayback');
const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
const locationInfo = document.getElementById('locationInfo');
const locationText = document.getElementById('locationText');
const mapContainer = document.getElementById('mapContainer');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const trackingId = document.getElementById('trackingId');
const viewReportsBtn = document.getElementById('viewReportsBtn');
const submitAnotherBtn = document.getElementById('submitAnotherBtn');

// State variables
let uploadedFiles = [];
let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingTime = 0;
let currentLocation = null;
let audioBlob = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupFormValidation();
    initializeGeolocation();
});

// Event Listeners
function initializeEventListeners() {
    // Form submission
    reportForm.addEventListener('submit', handleFormSubmit);
    
    // Character counter for description
    descriptionTextarea.addEventListener('input', updateCharCounter);
    
    // File upload
    photoUpload.addEventListener('click', () => photoInput.click());
    photoUpload.addEventListener('dragover', handleDragOver);
    photoUpload.addEventListener('drop', handleFileDrop);
    photoInput.addEventListener('change', handleFileSelect);
    
    // Voice recording
    recordBtn.addEventListener('click', toggleRecording);
    stopBtn.addEventListener('click', stopRecording);
    
    // Location
    useCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Form actions
    cancelBtn.addEventListener('click', resetForm);
    
    // Modal actions
    viewReportsBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        // Navigate to reports page
        showNotification('Navigating to My Reports...', 'info');
    });
    
    submitAnotherBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        resetForm();
    });
    
    // Navigation
    setupNavigation();
}

// Setup form validation
function setupFormValidation() {
    // Real-time validation
    categorySelect.addEventListener('change', validateForm);
    descriptionTextarea.addEventListener('input', validateForm);
    
    // Initial validation
    validateForm();
}

// Character counter
function updateCharCounter() {
    const count = descriptionTextarea.value.length;
    charCount.textContent = count;
    
    if (count > 1000) {
        charCount.style.color = '#dc3545';
        descriptionTextarea.value = descriptionTextarea.value.substring(0, 1000);
        charCount.textContent = '1000';
    } else if (count > 800) {
        charCount.style.color = '#ffc107';
    } else {
        charCount.style.color = '#666';
    }
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    photoUpload.classList.add('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    photoUpload.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showNotification('Please select only image files', 'error');
        return;
    }
    
    if (uploadedFiles.length + imageFiles.length > 5) {
        showNotification('Maximum 5 images allowed', 'error');
        return;
    }
    
    imageFiles.forEach(file => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification(`File ${file.name} is too large. Maximum size is 5MB`, 'error');
            return;
        }
        
        uploadedFiles.push(file);
        displayUploadedFile(file);
    });
    
    photoInput.value = ''; // Reset input
}

function displayUploadedFile(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas fa-image"></i>
            <span>${file.name}</span>
            <small>(${formatFileSize(file.size)})</small>
        </div>
        <button type="button" class="file-remove" onclick="removeFile('${file.name}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    uploadedPhotos.appendChild(fileItem);
}

function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    
    // Remove from DOM
    const fileItems = uploadedPhotos.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        if (item.textContent.includes(fileName)) {
            item.remove();
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Voice recording
async function toggleRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.style.display = 'block';
            
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        // Update UI
        recordBtn.style.display = 'none';
        recordingControls.style.display = 'flex';
        micIcon.classList.add('recording');
        recordingStatus.textContent = 'Recording in progress...';
        
        // Start timer
        recordingTime = 0;
        recordingInterval = setInterval(() => {
            recordingTime++;
            const minutes = Math.floor(recordingTime / 60);
            const seconds = recordingTime % 60;
            recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showNotification('Unable to access microphone. Please check permissions.', 'error');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        // Update UI
        recordBtn.style.display = 'flex';
        recordingControls.style.display = 'none';
        micIcon.classList.remove('recording');
        recordingStatus.textContent = 'Recording completed. You can play it back below.';
        
        // Clear timer
        clearInterval(recordingInterval);
        
        showNotification('Voice recording saved successfully!', 'success');
    }
}

// Location services
function initializeGeolocation() {
    if (!navigator.geolocation) {
        useCurrentLocationBtn.disabled = true;
        useCurrentLocationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Location not supported';
        return;
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    useCurrentLocationBtn.disabled = true;
    useCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            // Update UI
            locationInfo.style.display = 'block';
            locationText.textContent = `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`;
            
            // Update map placeholder
            mapContainer.innerHTML = `
                <div class="map-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <p>Location captured successfully</p>
                <small>Lat: ${currentLocation.latitude.toFixed(4)}, Lng: ${currentLocation.longitude.toFixed(4)}</small>
            `;
            mapContainer.style.background = '#d4edda';
            mapContainer.style.borderColor = '#c3e6cb';
            
            useCurrentLocationBtn.disabled = false;
            useCurrentLocationBtn.innerHTML = '<i class="fas fa-check"></i> Location captured';
            useCurrentLocationBtn.style.background = '#28a745';
            
            showNotification('Location captured successfully!', 'success');
        },
        (error) => {
            console.error('Geolocation error:', error);
            let message = 'Unable to get location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Location access denied by user.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
                default:
                    message += 'An unknown error occurred.';
                    break;
            }
            
            showNotification(message, 'error');
            useCurrentLocationBtn.disabled = false;
            useCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        }
    );
}

// Form validation
function validateForm() {
    const isValid = categorySelect.value && 
                   descriptionTextarea.value.trim().length >= 10;
    
    submitBtn.disabled = !isValid;
    
    if (isValid) {
        submitBtn.classList.add('enabled');
    } else {
        submitBtn.classList.remove('enabled');
    }
}

// Form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateFormData()) {
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate tracking ID
        const trackingNumber = generateTrackingId();
        
        // Show success modal
        showSuccessModal(trackingNumber);
        
        // Reset form
        setTimeout(() => {
            resetForm();
        }, 1000);
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('Failed to submit report. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Complaint</span><i class="fas fa-paper-plane"></i>';
    }
}

function validateFormData() {
    if (!categorySelect.value) {
        showNotification('Please select a category', 'error');
        categorySelect.focus();
        return false;
    }
    
    if (descriptionTextarea.value.trim().length < 10) {
        showNotification('Description must be at least 10 characters long', 'error');
        descriptionTextarea.focus();
        return false;
    }
    
    return true;
}

function generateTrackingId() {
    const prefix = 'JAN';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

function showSuccessModal(trackingNumber) {
    trackingId.textContent = trackingNumber;
    successModal.style.display = 'flex';
    
    // Store in localStorage for demo
    const reports = JSON.parse(localStorage.getItem('jansetuReports') || '[]');
    reports.push({
        id: trackingNumber,
        category: categorySelect.value,
        description: descriptionTextarea.value,
        location: currentLocation,
        files: uploadedFiles.length,
        hasAudio: !!audioBlob,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    });
    localStorage.setItem('jansetuReports', JSON.stringify(reports));
}

// Reset form
function resetForm() {
    reportForm.reset();
    uploadedFiles = [];
    uploadedPhotos.innerHTML = '';
    currentLocation = null;
    audioBlob = null;
    
    // Reset UI elements
    charCount.textContent = '0';
    locationInfo.style.display = 'none';
    audioPlayback.style.display = 'none';
    audioPlayback.src = '';
    
    // Reset location button
    useCurrentLocationBtn.disabled = false;
    useCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
    useCurrentLocationBtn.style.background = '#28a745';
    
    // Reset map
    mapContainer.innerHTML = `
        <div class="map-icon">
            <i class="fas fa-map-marked-alt"></i>
        </div>
        <p>Map view placeholder</p>
    `;
    mapContainer.style.background = '#f8f9fa';
    mapContainer.style.borderColor = '#e9ecef';
    
    // Reset recording UI
    recordBtn.style.display = 'flex';
    recordingControls.style.display = 'none';
    micIcon.classList.remove('recording');
    recordingStatus.textContent = 'Click to start recording voice message';
    recordingTimer.textContent = '00:00';
    
    validateForm();
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            const navItem = link.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
            
            // Show notification for demo
            const linkText = link.textContent.trim();
            showNotification(`Navigating to ${linkText}...`, 'info');
        });
    });
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                showNotification('Logging out...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(type)}"></i>
            </div>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        maxWidth: '350px',
        animation: 'slideInRight 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    });
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// Add notification animations to CSS dynamically
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-message {
        flex: 1;
        font-size: 0.9rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Demo functionality
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 JanSetu Dashboard Demo Mode Active');
    console.log('📋 All form features are functional');
    console.log('🎤 Voice recording requires microphone permission');
    console.log('📍 Location services require permission');
    
    // Add demo data button
    setTimeout(() => {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Fill Demo Data';
        demoBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        demoBtn.addEventListener('click', () => {
            categorySelect.value = 'roads';
            descriptionTextarea.value = 'There is a large pothole on Main Street near the bus stop that is causing traffic issues and could be dangerous for vehicles. The pothole appeared after the recent heavy rains and is approximately 2 feet wide and 6 inches deep.';
            updateCharCounter();
            validateForm();
            showNotification('Demo data filled!', 'success');
        });
        
        document.body.appendChild(demoBtn);
    }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!submitBtn.disabled) {
            reportForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && successModal.style.display !== 'none') {
        successModal.style.display = 'none';
    }
});

// Auto-save draft (optional feature)
let autoSaveTimeout;
function autoSaveDraft() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const draft = {
            category: categorySelect.value,
            description: descriptionTextarea.value,
            timestamp: Date.now()
        };
        
        if (draft.category || draft.description) {
            localStorage.setItem('jansetuDraft', JSON.stringify(draft));
        }
    }, 2000);
}

// Load draft on page load
function loadDraft() {
    const draft = localStorage.getItem('jansetuDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            // Only load if draft is less than 24 hours old
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                if (data.category) categorySelect.value = data.category;
                if (data.description) {
                    descriptionTextarea.value = data.description;
                    updateCharCounter();
                }
                validateForm();
                
                if (data.category || data.description) {
                    showNotification('Draft restored', 'info');
                }
            }
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
}

// Initialize draft functionality
categorySelect.addEventListener('change', autoSaveDraft);
descriptionTextarea.addEventListener('input', autoSaveDraft);

// Load draft when page loads
setTimeout(loadDraft, 500);
