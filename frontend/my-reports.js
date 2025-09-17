// DOM Elements
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const reportsGrid = document.getElementById('reportsGrid');
const noResults = document.getElementById('noResults');
const detailsModal = document.getElementById('detailsModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

// State
let allReports = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeReports();
    setupEventListeners();
    updateStatistics();
});

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterReports);
    statusFilter.addEventListener('change', filterReports);
    categoryFilter.addEventListener('change', filterReports);
    resetFiltersBtn.addEventListener('click', resetFilters);
    closeModal.addEventListener('click', () => detailsModal.style.display = 'none');
    
    // Close modal on outside click
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
    
    // Setup report card interactions
    setupReportCardListeners();
}

// Initialize reports data
function initializeReports() {
    allReports = Array.from(document.querySelectorAll('.report-card')).map(card => ({
        element: card,
        id: card.querySelector('.report-title').textContent.split(':')[0],
        title: card.querySelector('.report-title').textContent,
        description: card.querySelector('.report-description').textContent,
        location: card.querySelector('.report-location span').textContent,
        status: card.dataset.status,
        category: card.dataset.category,
        date: card.querySelector('.report-date').textContent,
        progress: parseInt(card.querySelector('.progress-text').textContent)
    }));
}

// Setup report card listeners
function setupReportCardListeners() {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reportId = e.target.dataset.id;
            showReportDetails(reportId);
        });
    });
    
    document.querySelectorAll('.update-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reportId = e.target.dataset.id;
            showNotification(`Updating report ${reportId}...`, 'info');
        });
    });
}

// Filter reports
function filterReports() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const categoryValue = categoryFilter.value;
    
    let visibleCount = 0;
    
    allReports.forEach(report => {
        const matchesSearch = !searchTerm || 
            report.title.toLowerCase().includes(searchTerm) ||
            report.description.toLowerCase().includes(searchTerm) ||
            report.location.toLowerCase().includes(searchTerm) ||
            report.id.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusValue || report.status === statusValue;
        const matchesCategory = !categoryValue || report.category === categoryValue;
        
        const isVisible = matchesSearch && matchesStatus && matchesCategory;
        
        report.element.style.display = isVisible ? 'block' : 'none';
        if (isVisible) visibleCount++;
    });
    
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

// Reset filters
function resetFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    categoryFilter.value = '';
    filterReports();
    showNotification('Filters reset', 'info');
}

// Show report details
function showReportDetails(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;
    
    modalTitle.textContent = report.title;
    modalBody.innerHTML = `
        <div class="modal-report-details">
            <div class="detail-row">
                <strong>Report ID:</strong> ${report.id}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> 
                <span class="status-badge ${report.status}">${formatStatus(report.status)}</span>
            </div>
            <div class="detail-row">
                <strong>Category:</strong> ${formatCategory(report.category)}
            </div>
            <div class="detail-row">
                <strong>Date Submitted:</strong> ${report.date}
            </div>
            <div class="detail-row">
                <strong>Location:</strong> ${report.location}
            </div>
            <div class="detail-row">
                <strong>Progress:</strong> ${report.progress}%
            </div>
            <div class="detail-row">
                <strong>Description:</strong>
                <p style="margin-top: 0.5rem; line-height: 1.6;">${report.description}</p>
            </div>
        </div>
    `;
    
    detailsModal.style.display = 'flex';
}

// Update statistics
function updateStatistics() {
    const stats = {
        total: allReports.length,
        pending: allReports.filter(r => r.status === 'pending').length,
        progress: allReports.filter(r => r.status === 'in-progress').length,
        resolved: allReports.filter(r => r.status === 'resolved' || r.status === 'closed').length
    };
    
    document.querySelector('.stat-card.total .stat-value').textContent = stats.total;
    document.querySelector('.stat-card.pending .stat-value').textContent = stats.pending;
    document.querySelector('.stat-card.progress .stat-value').textContent = stats.progress;
    document.querySelector('.stat-card.resolved .stat-value').textContent = stats.resolved;
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'closed': 'Closed',
        'rejected': 'Rejected'
    };
    return statusMap[status] || status;
}

// Format category
function formatCategory(category) {
    const categoryMap = {
        'roads': 'Roads & Infrastructure',
        'water': 'Water Supply',
        'waste': 'Waste Management',
        'electricity': 'Electricity',
        'public-safety': 'Public Safety',
        'drainage': 'Drainage System'
    };
    return categoryMap[category] || category;
}

// Show notification
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
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

// Add notification styles
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    .notification-icon { font-size: 1.2rem; }
    .notification-message { flex: 1; font-size: 0.9rem; }
    .notification-close {
        background: none; border: none; color: white;
        font-size: 18px; cursor: pointer; padding: 0;
        width: 20px; height: 20px; display: flex;
        align-items: center; justify-content: center; opacity: 0.8;
    }
    .notification-close:hover { opacity: 1; }
    .modal-report-details .detail-row {
        margin-bottom: 1rem; padding-bottom: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
    }
    .modal-report-details .detail-row:last-child { border-bottom: none; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const linkText = link.textContent.trim();
        showNotification(`Navigating to ${linkText}...`, 'info');
    });
});

// Logout
document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailsModal.style.display !== 'none') {
        detailsModal.style.display = 'none';
    }
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        searchInput.focus();
    }
});

console.log('🚀 JanSetu My Reports Demo Mode Active');
console.log('🔍 Use search and filters to find specific reports');
console.log('📊 Statistics update automatically based on report data');
