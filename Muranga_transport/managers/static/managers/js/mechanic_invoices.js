// Toggle sidebar
document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
});

// Modal functionality
const modal = document.getElementById('invoiceModal');
const approvalModal = document.getElementById('approvalModal');
const rejectionModal = document.getElementById('rejectionModal');
const viewButtons = document.querySelectorAll('.btn-view');
const approveButtons = document.querySelectorAll('.btn-approve');
const rejectButtons = document.querySelectorAll('.btn-reject');
const closeButtons = document.querySelectorAll('.close-modal');
const cancelApproval = document.getElementById('cancelApproval');
const confirmApproval = document.getElementById('confirmApproval');
const cancelRejection = document.getElementById('cancelRejection');
const confirmRejection = document.getElementById('confirmRejection');

// View invoice details
viewButtons.forEach(button => {
    button.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Approve invoice
approveButtons.forEach(button => {
    button.addEventListener('click', function() {
        approvalModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Reject invoice
rejectButtons.forEach(button => {
    button.addEventListener('click', function() {
        rejectionModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        modal.style.display = 'none';
        approvalModal.style.display = 'none';
        rejectionModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Cancel approval
cancelApproval.addEventListener('click', function() {
    approvalModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Confirm approval
confirmApproval.addEventListener('click', function() {
    // Here you would typically send an AJAX request to update the invoice status
    alert('Invoice approved successfully!');
    approvalModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Update the UI to reflect the new status
    const invoiceRow = document.querySelector('.btn-approve').closest('tr');
    invoiceRow.querySelector('.invoice-status').className = 'invoice-status status-approved';
    invoiceRow.querySelector('.invoice-status').textContent = 'Approved';
    
    // Remove the approve/reject buttons and add download button
    const actionsCell = invoiceRow.querySelector('.invoice-actions');
    actionsCell.innerHTML = `
        <button class="btn-view">View</button>
        <button class="btn-download"><i class="fas fa-download"></i></button>
    `;
    
    // Add event listeners to the new buttons
    actionsCell.querySelector('.btn-view').addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Cancel rejection
cancelRejection.addEventListener('click', function() {
    rejectionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Confirm rejection
confirmRejection.addEventListener('click', function() {
    const reason = document.getElementById('rejectionReason').value;
    const notes = document.getElementById('rejectionNotes').value;
    
    if (!reason || !notes) {
        alert('Please provide both a reason and notes for the rejection.');
        return;
    }
    
    // Here you would typically send an AJAX request to update the invoice status
    alert('Invoice rejected successfully!');
    rejectionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Update the UI to reflect the new status
    const invoiceRow = document.querySelector('.btn-reject').closest('tr');
    invoiceRow.querySelector('.invoice-status').className = 'invoice-status status-rejected';
    invoiceRow.querySelector('.invoice-status').textContent = 'Rejected';
    
    // Remove the approve/reject buttons and add download button
    const actionsCell = invoiceRow.querySelector('.invoice-actions');
    actionsCell.innerHTML = `
        <button class="btn-view">View</button>
        <button class="btn-download"><i class="fas fa-download"></i></button>
    `;
    
    // Add event listeners to the new buttons
    actionsCell.querySelector('.btn-view').addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (event.target === approvalModal) {
        approvalModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (event.target === rejectionModal) {
        rejectionModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Filter functionality
document.getElementById('invoice-search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Status filter
document.getElementById('invoice-status').addEventListener('change', function(e) {
    const status = e.target.value;
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const rowStatus = row.querySelector('.invoice-status').className;
            const shouldShow = rowStatus.includes(status);
            row.style.display = shouldShow ? '' : 'none';
        }
    });
});

// Type filter
document.getElementById('invoice-type').addEventListener('change', function(e) {
    const type = e.target.value;
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    rows.forEach(row => {
        if (type === 'all') {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.invoice-badge');
            const shouldShow = badge.className.includes(type);
            row.style.display = shouldShow ? '' : 'none';
        }
    });
});

// Mechanic filter
document.getElementById('mechanic').addEventListener('change', function(e) {
    const mechanic = e.target.value;
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    rows.forEach(row => {
        if (mechanic === 'all') {
            row.style.display = '';
        } else {
            const mechanicCell = row.querySelector('td:nth-child(5)');
            const shouldShow = mechanicCell.textContent.toLowerCase().includes(mechanic);
            row.style.display = shouldShow ? '' : 'none';
        }
    });
});

// Date range filter
document.getElementById('start-date').addEventListener('change', updateDateFilter);
document.getElementById('end-date').addEventListener('change', updateDateFilter);

function updateDateFilter() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    // If both dates are empty, show all rows
    if (!document.getElementById('start-date').value && !document.getElementById('end-date').value) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    rows.forEach(row => {
        const dateCell = row.querySelector('td:nth-child(2)');
        const rowDate = new Date(dateCell.textContent);
        
        let shouldShow = true;
        
        if (document.getElementById('start-date').value && rowDate < startDate) {
            shouldShow = false;
        }
        
        if (document.getElementById('end-date').value && rowDate > endDate) {
            shouldShow = false;
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Export functionality
document.getElementById('exportBtn').addEventListener('click', function() {
    const exportOptions = document.querySelector('.export-options');
    exportOptions.style.display = exportOptions.style.display === 'flex' ? 'none' : 'flex';
});

// Print invoice
document.querySelector('.btn-print').addEventListener('click', function() {
    window.print();
});

// Status update form
document.getElementById('statusUpdateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newStatus = document.getElementById('newStatus').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const statusNotes = document.getElementById('statusNotes').value;
    
    // Here you would typically send an AJAX request to update the status
    alert('Invoice status updated successfully!');
    
    // Update the modal to reflect the new status
    const statusElement = document.querySelector('.invoice-details-content .invoice-status');
    const statusText = document.getElementById('newStatus').options[document.getElementById('newStatus').selectedIndex].text;
    
    statusElement.className = `invoice-status status-${newStatus}`;
    statusElement.textContent = statusText;
    
    // Update the status history
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const statusHistory = document.querySelector('.status-history');
    const newHistoryItem = document.createElement('div');
    newHistoryItem.className = 'status-history-item';
    newHistoryItem.innerHTML = `
        <div class="status-history-date">${formattedDate}</div>
        <div class="status-history-details">
            <span class="status-history-action status-${newStatus}">${statusText}</span>
            <span class="status-history-user">Transport Manager</span>
            <p>${statusNotes || 'No additional notes provided'}</p>
        </div>
    `;
    
    statusHistory.insertBefore(newHistoryItem, statusHistory.firstChild);
    
    // Reset the form
    this.reset();
});

// Cancel status update
document.getElementById('cancelStatusUpdate').addEventListener('click', function() {
    document.getElementById('statusUpdateForm').reset();
});