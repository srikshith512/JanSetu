// DOM Elements
const loginForm = document.getElementById('loginForm');
const mobileNumberInput = document.getElementById('mobileNumber');
const getOtpBtn = document.getElementById('getOtpBtn');
const otpModal = document.getElementById('otpModal');
const closeOtpModal = document.getElementById('closeOtpModal');
const otpDigits = document.querySelectorAll('.otp-digit');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendOtpBtn = document.getElementById('resendOtpBtn');
const displayMobile = document.getElementById('displayMobile');
const timerElement = document.getElementById('timer');
const successMessage = document.getElementById('successMessage');

// State variables
let currentMobile = '';
let otpTimer = null;
let timeLeft = 30;
let generatedOtp = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupInputValidation();
});

// Event Listeners
function initializeEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // OTP modal close
    closeOtpModal.addEventListener('click', closeOtpModalHandler);
    
    // OTP input handling
    otpDigits.forEach((input, index) => {
        input.addEventListener('input', (e) => handleOtpInput(e, index));
        input.addEventListener('keydown', (e) => handleOtpKeydown(e, index));
        input.addEventListener('paste', handleOtpPaste);
    });
    
    // OTP verification
    verifyOtpBtn.addEventListener('click', handleOtpVerification);
    
    // Resend OTP
    resendOtpBtn.addEventListener('click', handleResendOtp);
    
    // Close modal on outside click
    otpModal.addEventListener('click', (e) => {
        if (e.target === otpModal) {
            closeOtpModalHandler();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && otpModal.style.display !== 'none') {
            closeOtpModalHandler();
        }
    });
}

// Input validation setup
function setupInputValidation() {
    mobileNumberInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        e.target.value = value;
        
        // Update button state
        updateGetOtpButton();
    });
    
    mobileNumberInput.addEventListener('keypress', function(e) {
        // Only allow numeric input
        if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Update Get OTP button state
function updateGetOtpButton() {
    const isValid = mobileNumberInput.value.length === 10;
    getOtpBtn.disabled = !isValid;
    
    if (isValid) {
        getOtpBtn.classList.add('enabled');
    } else {
        getOtpBtn.classList.remove('enabled');
    }
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const mobileNumber = mobileNumberInput.value.trim();
    
    if (!validateMobileNumber(mobileNumber)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    currentMobile = mobileNumber;
    
    // Show loading state
    showLoadingState(true);
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate OTP (in real app, this would be done on server)
        generatedOtp = generateOtp();
        console.log('Generated OTP:', generatedOtp); // For demo purposes
        
        // Show success notification
        showNotification('OTP sent successfully!', 'success');
        
        // Show OTP modal
        showOtpModal();
        
    } catch (error) {
        showNotification('Failed to send OTP. Please try again.', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Validate mobile number
function validateMobileNumber(number) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
}

// Generate random OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show loading state
function showLoadingState(isLoading) {
    const btnText = getOtpBtn.querySelector('.btn-text');
    const spinner = getOtpBtn.querySelector('.loading-spinner');
    
    if (isLoading) {
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        getOtpBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        spinner.style.display = 'none';
        getOtpBtn.disabled = false;
    }
}

// Show OTP modal
function showOtpModal() {
    displayMobile.textContent = `+91 ${currentMobile}`;
    otpModal.style.display = 'flex';
    
    // Focus first OTP input
    setTimeout(() => {
        otpDigits[0].focus();
    }, 100);
    
    // Start timer
    startResendTimer();
    
    // Clear previous OTP inputs
    otpDigits.forEach(input => input.value = '');
}

// Close OTP modal
function closeOtpModalHandler() {
    otpModal.style.display = 'none';
    clearResendTimer();
    
    // Clear OTP inputs
    otpDigits.forEach(input => input.value = '');
}

// Handle OTP input
function handleOtpInput(e, index) {
    const value = e.target.value;
    
    // Only allow single digit
    if (value.length > 1) {
        e.target.value = value.slice(-1);
    }
    
    // Move to next input if digit entered
    if (value && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
    }
    
    // Auto-verify if all digits entered
    if (index === otpDigits.length - 1 && value) {
        setTimeout(() => {
            const otp = getEnteredOtp();
            if (otp.length === 6) {
                handleOtpVerification();
            }
        }, 100);
    }
}

// Handle OTP keydown events
function handleOtpKeydown(e, index) {
    // Handle backspace
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpDigits[index - 1].focus();
        otpDigits[index - 1].value = '';
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
        otpDigits[index - 1].focus();
    }
    
    if (e.key === 'ArrowRight' && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
        handleOtpVerification();
    }
}

// Handle OTP paste
function handleOtpPaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
        otpDigits.forEach((input, index) => {
            input.value = pastedData[index] || '';
        });
        
        // Focus last input
        otpDigits[5].focus();
        
        // Auto-verify
        setTimeout(() => handleOtpVerification(), 100);
    }
}

// Get entered OTP
function getEnteredOtp() {
    return Array.from(otpDigits).map(input => input.value).join('');
}

// Handle OTP verification
async function handleOtpVerification() {
    const enteredOtp = getEnteredOtp();
    
    if (enteredOtp.length !== 6) {
        showNotification('Please enter complete OTP', 'error');
        return;
    }
    
    // Show loading state
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying...';
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify OTP (in real app, this would be done on server)
        if (enteredOtp === generatedOtp) {
            // Success
            closeOtpModalHandler();
            showSuccessMessage();
        } else {
            // Invalid OTP
            showNotification('Invalid OTP. Please try again.', 'error');
            
            // Clear OTP inputs
            otpDigits.forEach(input => input.value = '');
            otpDigits[0].focus();
        }
        
    } catch (error) {
        showNotification('Verification failed. Please try again.', 'error');
    } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify OTP';
    }
}

// Handle resend OTP
async function handleResendOtp() {
    if (resendOtpBtn.disabled) return;
    
    resendOtpBtn.disabled = true;
    resendOtpBtn.textContent = 'Sending...';
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate new OTP
        generatedOtp = generateOtp();
        console.log('New OTP:', generatedOtp); // For demo purposes
        
        showNotification('New OTP sent successfully!', 'success');
        
        // Restart timer
        startResendTimer();
        
        // Clear and focus first input
        otpDigits.forEach(input => input.value = '');
        otpDigits[0].focus();
        
    } catch (error) {
        showNotification('Failed to resend OTP. Please try again.', 'error');
    } finally {
        resendOtpBtn.textContent = 'Resend OTP';
    }
}

// Start resend timer
function startResendTimer() {
    timeLeft = 30;
    resendOtpBtn.disabled = true;
    updateTimerDisplay();
    
    otpTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearResendTimer();
            resendOtpBtn.disabled = false;
        }
    }, 1000);
}

// Clear resend timer
function clearResendTimer() {
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
}

// Update timer display
function updateTimerDisplay() {
    timerElement.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        timerElement.parentElement.style.display = 'none';
    } else {
        timerElement.parentElement.style.display = 'block';
    }
}

// Show success message
function showSuccessMessage() {
    document.querySelector('.login-container').style.display = 'none';
    successMessage.style.display = 'block';
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
        showNotification('Redirecting to dashboard...', 'info');
        // In a real app, you would redirect to the actual dashboard
        window.location.href = 'dashboard.html';
    }, 3000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles for notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease'
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

// Get notification color based on type
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
        justify-content: space-between;
        align-items: center;
        gap: 10px;
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
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Utility function to format mobile number for display
function formatMobileNumber(number) {
    return number.replace(/(\d{5})(\d{5})/, '$1 $2');
}

// Add some demo functionality for testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add demo mode indicator
    console.log('🚀 JanSetu Demo Mode Active');
    console.log('📱 Use any 10-digit number starting with 6-9');
    console.log('🔐 OTP will be logged to console');
    
    // Add demo button for quick testing
    setTimeout(() => {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Demo Fill';
        demoBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
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
            mobileNumberInput.value = '9876543210';
            updateGetOtpButton();
        });
        
        document.body.appendChild(demoBtn);
    }, 1000);
}
