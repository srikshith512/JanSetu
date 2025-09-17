// DOM Elements
const searchInput = document.getElementById('searchInput');
const locationFilter = document.getElementById('locationFilter');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const statusFilter = document.getElementById('statusFilter');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const tableBody = document.getElementById('tableBody');
const actionModal = document.getElementById('actionModal');
const closeModal = document.getElementById('closeModal');
const viewBtn = document.getElementById('viewBtn');
const assignBtn = document.getElementById('assignBtn');
const updateBtn = document.getElementById('updateBtn');

// State variables
let complaintsData = [];
let filteredData = [];
let currentComplaintId = null;
let categoryChart = null;
let statusChart = null;

// Sample complaint data
const sampleComplaints = [
    {
        id: 'JSO-001',
        category: 'Road Repair',
        location: 'Ranchi, Main St',
        priority: 'High',
        status: 'Active',
        assignedTo: 'Team A',
        date: '2024-07-30',
        description: 'Large potholes causing traffic issues'
    },
    {
        id: 'JSO-002',
        category: 'Sanitation',
        location: 'Jamshedpur, Sector 7',
        priority: 'Medium',
        status: 'Assigned',
        assignedTo: 'Waste Agent',
        date: '2024-07-29',
        description: 'Overflowing garbage bins in residential area'
    },
    {
        id: 'JSO-003',
        category: 'Water Supply',
        location: 'Dhanbad, Block A',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'Water Board',
        date: '2024-07-28',
        description: 'Irregular water supply affecting households'
    },
    {
        id: 'JSO-004',
        category: 'Electricity',
        location: 'Bokaro, Phase 2',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'Electricity Dept',
        date: '2024-07-27',
        description: 'Frequent power outages during peak hours'
    },
    {
        id: 'JSO-005',
        category: 'Public Safety',
        location: 'Ranchi, Market St',
        priority: 'Medium',
        status: 'Closed',
        assignedTo: 'Police Dept',
        date: '2024-07-26',
        description: 'Broken streetlights creating safety concerns'
    },
    {
        id: 'JSO-006',
        category: 'Road Repair',
        location: 'Hazaribagh, Bypass',
        priority: 'High',
        status: 'Assigned',
        assignedTo: 'Public Works',
        date: '2024-07-25',
        description: 'Road surface damage after monsoon'
    },
    {
        id: 'JSO-007',
        category: 'Sanitation',
        location: 'Ranchi, Old Town',
        priority: 'Medium',
        status: 'Active',
        assignedTo: 'N/A',
        date: '2024-07-24',
        description: 'Drainage blockage causing waterlogging'
    },
    {
        id: 'JSO-008',
        category: 'Water Supply',
        location: 'Jamshedpur, Hill Rd',
        priority: 'Low',
        status: 'Assigned',
        assignedTo: 'Water Board',
        date: '2024-07-23',
        description: 'Low water pressure in residential area'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    complaintsData = [...sampleComplaints];
    filteredData = [...complaintsData];
    initializeEventListeners();
    renderTable();
    initializeCharts();
    updateStatistics();
});

// Setup event listeners
function initializeEventListeners() {
    // Filter controls
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Modal controls
    closeModal.addEventListener('click', () => actionModal.style.display = 'none');
    viewBtn.addEventListener('click', handleViewAction);
    assignBtn.addEventListener('click', handleAssignAction);
    updateBtn.addEventListener('click', handleUpdateAction);
    
    // Close modal on outside click
    actionModal.addEventListener('click', (e) => {
        if (e.target === actionModal) actionModal.style.display = 'none';
    });
    
    // Navigation
    setupNavigation();
}

// Apply filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const location = locationFilter.value;
    const category = categoryFilter.value;
    const priority = priorityFilter.value;
    const status = statusFilter.value;
    
    filteredData = complaintsData.filter(complaint => {
        const matchesSearch = !searchTerm || 
            complaint.id.toLowerCase().includes(searchTerm) ||
            complaint.category.toLowerCase().includes(searchTerm) ||
            complaint.location.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm);
            
        const matchesLocation = !location || complaint.location.includes(location);
        const matchesCategory = !category || complaint.category === category;
        const matchesPriority = !priority || complaint.priority === priority;
        const matchesStatus = !status || complaint.status === status;
        
        return matchesSearch && matchesLocation && matchesCategory && matchesPriority && matchesStatus;
    });
    
    renderTable();
    updateCharts();
    showNotification(`Filtered ${filteredData.length} complaints`, 'info');
}

// Clear filters
function clearFilters() {
    searchInput.value = '';
    locationFilter.value = '';
    categoryFilter.value = '';
    priorityFilter.value = '';
    statusFilter.value = '';
    
    filteredData = [...complaintsData];
    renderTable();
    updateCharts();
    showNotification('Filters cleared', 'info');
}

// Render table
function renderTable() {
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No complaints found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="complaint-id" onclick="showComplaintActions('${complaint.id}')">${complaint.id}</span>
            </td>
            <td>${complaint.category}</td>
            <td>${complaint.location}</td>
            <td>
                <span class="priority-badge ${complaint.priority.toLowerCase()}">${complaint.priority}</span>
            </td>
            <td>
                <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </td>
            <td>${complaint.assignedTo}</td>
            <td>${complaint.date}</td>
            <td class="action-cell">
                <button class="action-dots" onclick="showComplaintActions('${complaint.id}')" title="Actions">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show complaint actions modal
function showComplaintActions(complaintId) {
    currentComplaintId = complaintId;
    const complaint = complaintsData.find(c => c.id === complaintId);
    
    if (complaint) {
        document.getElementById('modalTitle').textContent = `Actions for ${complaint.id}`;
        actionModal.style.display = 'flex';
    }
}

// Handle view action
function handleViewAction() {
    const complaint = complaintsData.find(c => c.id === currentComplaintId);
    if (complaint) {
        showNotification(`Viewing details for ${complaint.id}`, 'info');
        actionModal.style.display = 'none';
    }
}

// Handle assign action
function handleAssignAction() {
    const complaint = complaintsData.find(c => c.id === currentComplaintId);
    if (complaint) {
        showNotification(`Assignment dialog for ${complaint.id}`, 'info');
        actionModal.style.display = 'none';
    }
}

// Handle update action
function handleUpdateAction() {
    const complaint = complaintsData.find(c => c.id === currentComplaintId);
    if (complaint) {
        // Cycle through statuses
        const statuses = ['Active', 'Assigned', 'Resolved', 'Closed'];
        const currentIndex = statuses.indexOf(complaint.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        complaint.status = statuses[nextIndex];
        
        renderTable();
        updateCharts();
        updateStatistics();
        showNotification(`Status updated to ${complaint.status}`, 'success');
        actionModal.style.display = 'none';
    }
}

// Initialize charts
function initializeCharts() {
    initializeCategoryChart();
    initializeStatusChart();
}

// Initialize category chart (donut chart)
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const categoryData = getCategoryData();
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.values,
                backgroundColor: [
                    '#4285F4',
                    '#34A853',
                    '#FBBC04',
                    '#EA4335',
                    '#9AA0A6'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Initialize status chart (bar chart)
function initializeStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    const statusData = getStatusData();
    
    statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statusData.labels,
            datasets: [{
                data: statusData.values,
                backgroundColor: [
                    '#4285F4',
                    '#FBBC04',
                    '#34A853',
                    '#9AA0A6'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Get category data for chart
function getCategoryData() {
    const categories = {};
    filteredData.forEach(complaint => {
        categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    return {
        labels: Object.keys(categories),
        values: Object.values(categories)
    };
}

// Get status data for chart
function getStatusData() {
    const statuses = {};
    filteredData.forEach(complaint => {
        statuses[complaint.status] = (statuses[complaint.status] || 0) + 1;
    });
    
    return {
        labels: Object.keys(statuses),
        values: Object.values(statuses)
    };
}

// Update charts
function updateCharts() {
    if (categoryChart) {
        const categoryData = getCategoryData();
        categoryChart.data.labels = categoryData.labels;
        categoryChart.data.datasets[0].data = categoryData.values;
        categoryChart.update();
    }
    
    if (statusChart) {
        const statusData = getStatusData();
        statusChart.data.labels = statusData.labels;
        statusChart.data.datasets[0].data = statusData.values;
        statusChart.update();
    }
}

// Update statistics
function updateStatistics() {
    const total = complaintsData.length;
    const pending = complaintsData.filter(c => c.status === 'Active').length;
    const inProgress = complaintsData.filter(c => c.status === 'Assigned').length;
    const resolved = complaintsData.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    
    document.querySelector('.stat-card.total .stat-value').textContent = total.toLocaleString();
    document.querySelector('.stat-card.pending .stat-value').textContent = pending.toLocaleString();
    document.querySelector('.stat-card.progress .stat-value').textContent = inProgress.toLocaleString();
    document.querySelector('.stat-card.resolved .stat-value').textContent = resolved.toLocaleString();
}

// Navigation setup
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.trim();
            showNotification(`Navigating to ${linkText}...`, 'info');
        });
    });
    
    // Logout functionality
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            showNotification('Logging out...', 'info');
            setTimeout(() => window.location.href = 'index.html', 1000);
        }
    });
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
const additionalStyles = `
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
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && actionModal.style.display !== 'none') {
        actionModal.style.display = 'none';
    }
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        searchInput.focus();
    }
});

console.log('🚀 JanSetu Employee Dashboard Demo Mode Active');
console.log('📊 Charts update automatically based on filtered data');
console.log('🔍 Use filters to analyze complaint patterns');
