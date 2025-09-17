// DOM Elements
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const exportBtn = document.getElementById('exportBtn');
const tableBody = document.getElementById('tableBody');
const viewAllBtn = document.getElementById('viewAllBtn');
const detailsModal = document.getElementById('detailsModal');
const assignModal = document.getElementById('assignModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const closeAssignModal = document.getElementById('closeAssignModal');
const assignBtn = document.getElementById('assignBtn');
const updateStatusBtn = document.getElementById('updateStatusBtn');
const assigneeSelect = document.getElementById('assigneeSelect');
const assignmentNotes = document.getElementById('assignmentNotes');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');
const cancelAssignBtn = document.getElementById('cancelAssignBtn');
const paginationInfo = document.getElementById('paginationInfo');
const pageNumbers = document.getElementById('pageNumbers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// State variables
let complaintsData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentComplaintId = null;

// Sample complaint data
const sampleComplaints = [
    {
        id: 'JSP-001',
        category: 'Roads',
        status: 'In Progress',
        priority: 'High',
        location: 'Ranchi',
        reportedOn: '2024-07-28',
        assignedTo: 'Team A',
        description: 'Large potholes near Ranchi main market causing traffic issues',
        reporter: 'Rajesh Kumar',
        phone: '+91 9876543210'
    },
    {
        id: 'JSP-002',
        category: 'Sanitation',
        status: 'Pending',
        priority: 'Medium',
        location: 'Jamshedpur',
        reportedOn: '2024-07-27',
        assignedTo: 'N/A',
        description: 'Overflowing garbage bins in residential area',
        reporter: 'Priya Singh',
        phone: '+91 9876543211'
    },
    {
        id: 'JSP-003',
        category: 'Water Supply',
        status: 'Resolved',
        priority: 'Low',
        location: 'Dhanbad',
        reportedOn: '2024-07-26',
        assignedTo: 'Officer Singh',
        description: 'Irregular water supply affecting multiple households',
        reporter: 'Amit Sharma',
        phone: '+91 9876543212'
    },
    {
        id: 'JSP-004',
        category: 'Electricity',
        status: 'In Progress',
        priority: 'High',
        location: 'Bokaro',
        reportedOn: '2024-07-25',
        assignedTo: 'Team B',
        description: 'Frequent power outages during peak hours',
        reporter: 'Sunita Devi',
        phone: '+91 9876543213'
    },
    {
        id: 'JSP-005',
        category: 'Public Park',
        status: 'Pending',
        priority: 'Medium',
        location: 'Hazaribagh',
        reportedOn: '2024-07-24',
        assignedTo: 'N/A',
        description: 'Broken playground equipment needs repair',
        reporter: 'Vikash Gupta',
        phone: '+91 9876543214'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    complaintsData = [...sampleComplaints];
    filteredData = [...complaintsData];
    initializeEventListeners();
    renderTable();
    updatePagination();
    updateStatistics();
});

// Setup event listeners
function initializeEventListeners() {
    // Search and filters
    searchInput.addEventListener('input', handleSearch);
    statusFilter.addEventListener('change', handleFilter);
    priorityFilter.addEventListener('change', handleFilter);
    
    // Buttons
    exportBtn.addEventListener('click', handleExport);
    viewAllBtn.addEventListener('click', () => showNotification('Viewing all complaints...', 'info'));
    
    // Modal controls
    closeModal.addEventListener('click', () => detailsModal.style.display = 'none');
    closeAssignModal.addEventListener('click', () => assignModal.style.display = 'none');
    assignBtn.addEventListener('click', () => showAssignModal());
    updateStatusBtn.addEventListener('click', handleStatusUpdate);
    confirmAssignBtn.addEventListener('click', handleAssignment);
    cancelAssignBtn.addEventListener('click', () => assignModal.style.display = 'none');
    
    // Pagination
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Close modals on outside click
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) detailsModal.style.display = 'none';
    });
    
    assignModal.addEventListener('click', (e) => {
        if (e.target === assignModal) assignModal.style.display = 'none';
    });
    
    // Statistics card view details
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            handleStatFilter(type);
        });
    });
    
    // Navigation
    setupNavigation();
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    applyFilters();
}

// Handle filters
function handleFilter() {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    
    filteredData = complaintsData.filter(complaint => {
        const matchesSearch = !searchTerm || 
            complaint.id.toLowerCase().includes(searchTerm) ||
            complaint.category.toLowerCase().includes(searchTerm) ||
            complaint.location.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusValue || complaint.status === statusValue;
        const matchesPriority = !priorityValue || complaint.priority === priorityValue;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    currentPage = 1;
    renderTable();
    updatePagination();
}

// Handle stat card filters
function handleStatFilter(type) {
    // Clear existing filters
    searchInput.value = '';
    statusFilter.value = '';
    priorityFilter.value = '';
    
    // Apply specific filter based on type
    switch(type) {
        case 'pending':
            statusFilter.value = 'Pending';
            break;
        case 'resolved':
            statusFilter.value = 'Resolved';
            break;
        case 'priority':
            priorityFilter.value = 'High';
            break;
    }
    
    applyFilters();
    showNotification(`Filtered by ${type} complaints`, 'info');
}

// Render table
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (pageData.length === 0) {
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
    
    pageData.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="complaint-id" onclick="showComplaintDetails('${complaint.id}')">${complaint.id}</span>
            </td>
            <td>${complaint.category}</td>
            <td>
                <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </td>
            <td>
                <span class="priority-badge ${complaint.priority.toLowerCase()}">${complaint.priority}</span>
            </td>
            <td>${complaint.location}</td>
            <td>${complaint.reportedOn}</td>
            <td>${complaint.assignedTo}</td>
            <td class="actions-cell">
                <button class="action-btn" onclick="showComplaintDetails('${complaint.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editComplaint('${complaint.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="deleteComplaint('${complaint.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
    
    // Update pagination info
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${filteredData.length} complaints`;
    
    // Update navigation buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => changePage(i));
        pageNumbers.appendChild(pageBtn);
    }
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        updatePagination();
    }
}

// Show complaint details
function showComplaintDetails(complaintId) {
    const complaint = complaintsData.find(c => c.id === complaintId);
    if (!complaint) return;
    
    currentComplaintId = complaintId;
    modalTitle.textContent = `Complaint Details - ${complaint.id}`;
    
    modalBody.innerHTML = `
        <div class="complaint-details">
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Complaint ID:</strong>
                    <span>${complaint.id}</span>
                </div>
                <div class="detail-item">
                    <strong>Category:</strong>
                    <span>${complaint.category}</span>
                </div>
                <div class="detail-item">
                    <strong>Status:</strong>
                    <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
                </div>
                <div class="detail-item">
                    <strong>Priority:</strong>
                    <span class="priority-badge ${complaint.priority.toLowerCase()}">${complaint.priority}</span>
                </div>
                <div class="detail-item">
                    <strong>Location:</strong>
                    <span>${complaint.location}</span>
                </div>
                <div class="detail-item">
                    <strong>Reported On:</strong>
                    <span>${complaint.reportedOn}</span>
                </div>
                <div class="detail-item">
                    <strong>Assigned To:</strong>
                    <span>${complaint.assignedTo}</span>
                </div>
                <div class="detail-item">
                    <strong>Reporter:</strong>
                    <span>${complaint.reporter}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${complaint.phone}</span>
                </div>
            </div>
            <div class="detail-description">
                <strong>Description:</strong>
                <p>${complaint.description}</p>
            </div>
        </div>
    `;
    
    detailsModal.style.display = 'flex';
}

// Show assign modal
function showAssignModal() {
    if (!currentComplaintId) return;
    assignModal.style.display = 'flex';
    assigneeSelect.focus();
}

// Handle assignment
function handleAssignment() {
    const assignee = assigneeSelect.value;
    const notes = assignmentNotes.value;
    
    if (!assignee) {
        showNotification('Please select an assignee', 'error');
        return;
    }
    
    // Update complaint data
    const complaint = complaintsData.find(c => c.id === currentComplaintId);
    if (complaint) {
        complaint.assignedTo = assignee;
        if (complaint.status === 'Pending') {
            complaint.status = 'In Progress';
        }
    }
    
    // Close modal and refresh
    assignModal.style.display = 'none';
    detailsModal.style.display = 'none';
    renderTable();
    updateStatistics();
    
    showNotification(`Complaint ${currentComplaintId} assigned to ${assignee}`, 'success');
    
    // Clear form
    assigneeSelect.value = '';
    assignmentNotes.value = '';
}

// Handle status update
function handleStatusUpdate() {
    if (!currentComplaintId) return;
    
    const complaint = complaintsData.find(c => c.id === currentComplaintId);
    if (!complaint) return;
    
    // Cycle through statuses
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    const currentIndex = statuses.indexOf(complaint.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    complaint.status = statuses[nextIndex];
    
    detailsModal.style.display = 'none';
    renderTable();
    updateStatistics();
    
    showNotification(`Status updated to ${complaint.status}`, 'success');
}

// Edit complaint
function editComplaint(complaintId) {
    showNotification(`Edit functionality for ${complaintId} would be implemented here`, 'info');
}

// Delete complaint
function deleteComplaint(complaintId) {
    if (confirm(`Are you sure you want to delete complaint ${complaintId}?`)) {
        complaintsData = complaintsData.filter(c => c.id !== complaintId);
        applyFilters();
        updateStatistics();
        showNotification(`Complaint ${complaintId} deleted successfully`, 'success');
    }
}

// Handle export
function handleExport() {
    const csvContent = generateCSV(filteredData);
    downloadCSV(csvContent, 'complaints-export.csv');
    showNotification('Data exported successfully!', 'success');
}

// Generate CSV content
function generateCSV(data) {
    const headers = ['ID', 'Category', 'Status', 'Priority', 'Location', 'Reported On', 'Assigned To', 'Reporter', 'Phone', 'Description'];
    const csvRows = [headers.join(',')];
    
    data.forEach(complaint => {
        const row = [
            complaint.id,
            complaint.category,
            complaint.status,
            complaint.priority,
            complaint.location,
            complaint.reportedOn,
            complaint.assignedTo,
            complaint.reporter,
            complaint.phone,
            `"${complaint.description.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Update statistics
function updateStatistics() {
    const total = complaintsData.length;
    const pending = complaintsData.filter(c => c.status === 'Pending').length;
    const resolved = complaintsData.filter(c => c.status === 'Resolved').length;
    const highPriority = complaintsData.filter(c => c.priority === 'High').length;
    
    document.querySelector('.stat-card.total .stat-value').textContent = total.toLocaleString();
    document.querySelector('.stat-card.pending .stat-value').textContent = pending.toLocaleString();
    document.querySelector('.stat-card.resolved .stat-value').textContent = resolved.toLocaleString();
    document.querySelector('.stat-card.priority .stat-value').textContent = highPriority.toLocaleString();
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

// Add notification and detail styles
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
    .complaint-details {
        font-size: 0.9rem;
    }
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .detail-item strong {
        color: #666;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .detail-description {
        padding-top: 1rem;
        border-top: 1px solid #e9ecef;
    }
    .detail-description p {
        margin-top: 0.5rem;
        line-height: 1.6;
        color: #333;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (detailsModal.style.display !== 'none') {
            detailsModal.style.display = 'none';
        }
        if (assignModal.style.display !== 'none') {
            assignModal.style.display = 'none';
        }
    }
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        searchInput.focus();
    }
});

console.log('🚀 JanSetu Admin Dashboard Demo Mode Active');
console.log('📊 Statistics update automatically based on complaint data');
console.log('🔍 Use search and filters to manage complaints efficiently');
