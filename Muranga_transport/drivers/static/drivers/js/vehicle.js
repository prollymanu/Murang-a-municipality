document.addEventListener('DOMContentLoaded', function() {
    // Request Maintenance Button
    const requestBtn = document.querySelector('.page-actions button');
    if (requestBtn) {
        requestBtn.addEventListener('click', function() {
            // In a real application, this would open a maintenance request form
            window.location.href = 'maintenance.html';
        });
    }
    
    // View Documents Button
    const docsBtn = document.querySelector('.btn-docs');
    if (docsBtn) {
        docsBtn.addEventListener('click', function() {
            alert('Vehicle documents will be displayed in a new window');
        });
    }
    
    // Scan QR Code Button
    const scanBtn = document.querySelector('.btn-scan');
    if (scanBtn) {
        scanBtn.addEventListener('click', function() {
            alert('QR code scanner will be activated');
        });
    }
    
    // Logout confirmation
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to logout?')) {
                e.preventDefault();
            }
        });
    }
});