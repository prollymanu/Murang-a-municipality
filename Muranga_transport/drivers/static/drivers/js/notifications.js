document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const notificationsList = document.getElementById('notificationList');
    const emptyState = document.getElementById('emptyState');
    const unreadCountBadge = document.getElementById('unreadCount');
    const markAllReadBtn = document.getElementById('markAllRead');
    const acceptTaskModal = document.getElementById('acceptTaskModal');
    const cancelAcceptBtn = document.getElementById('cancelAcceptTask');
    const confirmAcceptBtn = document.getElementById('confirmAcceptTask');
    const notificationDetailsModal = document.getElementById('notificationDetailsModal');
    const closeDetailsBtn = document.getElementById('closeDetails');
    const takeActionBtn = document.getElementById('takeActionBtn');
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Filter notifications
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterNotifications(filter);
        });
    });
    
    function filterNotifications(filter) {
        const notifications = document.querySelectorAll('.notification-item');
        let visibleCount = 0;
        
        notifications.forEach(notification => {
            const type = notification.getAttribute('data-type');
            const isUnread = notification.classList.contains('unread');
            const status = notification.getAttribute('data-status');
            
            let shouldShow = false;
            
            switch(filter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'unread':
                    shouldShow = isUnread;
                    break;
                case 'assignments':
                    shouldShow = type === 'assignment';
                    break;
                case 'vehicle':
                    shouldShow = type === 'vehicle';
                    break;
                default:
                    shouldShow = true;
            }
            
            if (shouldShow) {
                notification.style.display = 'flex';
                visibleCount++;
            } else {
                notification.style.display = 'none';
            }
        });
        
        // Show empty state if no notifications match the filter
        if (visibleCount === 0) {
            notificationsList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            notificationsList.style.display = 'block';
            emptyState.style.display = 'none';
        }
    }
    
    // Mark notification as read when clicked
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking on a button
            if (e.target.tagName === 'BUTTON') return;
            
            if (this.classList.contains('unread')) {
                this.classList.remove('unread');
                updateUnreadCount();
            }
        });
    });
    
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            const type = notificationItem.getAttribute('data-type');
            
            showNotificationDetails(notificationId, type);
        });
    });
    
    // Accept buttons
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            
            openAcceptTaskModal(notificationId);
        });
    });
    
    // Decline buttons
    document.querySelectorAll('.decline-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            
            if (confirm('Are you sure you want to decline this assignment?')) {
                // Mark as declined
                notificationItem.setAttribute('data-status', 'declined');
                
                // Update the notification content
                const contentDiv = notificationItem.querySelector('.notification-content');
                contentDiv.querySelector('.notification-title-text').textContent = 'Assignment Declined';
                contentDiv.querySelector('.notification-message').textContent = 'You declined: Vehicle #KAB 456B - Brake System Check';
                
                // Remove action buttons
                const actionsDiv = notificationItem.querySelector('.notification-actions');
                if (actionsDiv) actionsDiv.remove();
                
                // Add declined status
                const statusDiv = document.createElement('div');
                statusDiv.className = 'notification-status status-declined';
                statusDiv.innerHTML = '✗ Declined';
                contentDiv.appendChild(statusDiv);
                
                // Mark as read
                notificationItem.classList.remove('unread');
                
                // Update notification count
                updateUnreadCount();
            }
        });
    });
    
    // Mark all as read button
    markAllReadBtn.addEventListener('click', function() {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        updateUnreadCount();
        
        // Show confirmation
        showToast('All notifications marked as read');
    });
    
    // Setup accept task modal
    cancelAcceptBtn.addEventListener('click', closeAcceptTaskModal);
    
    confirmAcceptBtn.addEventListener('click', function() {
        const notificationId = parseInt(this.getAttribute('data-notification-id'));
        const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
        
        if (notificationItem) {
            // Mark as accepted
            notificationItem.setAttribute('data-status', 'accepted');
            
            // Update the notification content
            const contentDiv = notificationItem.querySelector('.notification-content');
            contentDiv.querySelector('.notification-title-text').textContent = 'Assignment Accepted';
            contentDiv.querySelector('.notification-message').textContent = 'You accepted: Vehicle #KAB 456B - Brake System Check';
            
            // Remove action buttons
            const actionsDiv = notificationItem.querySelector('.notification-actions');
            if (actionsDiv) actionsDiv.remove();
            
            // Add accepted status
            const statusDiv = document.createElement('div');
            statusDiv.className = 'notification-status status-accepted';
            statusDiv.innerHTML = '✓ Accepted';
            contentDiv.appendChild(statusDiv);
            
            // Mark as read
            notificationItem.classList.remove('unread');
            
            // Update notification count
            updateUnreadCount();
            
            // Close modal
            closeAcceptTaskModal();
            
            // Show confirmation
            showToast('Assignment accepted successfully');
        }
    });
    
    // Setup notification details modal
    closeDetailsBtn.addEventListener('click', closeNotificationDetailsModal);
    
    // Take action button in details modal
    takeActionBtn.addEventListener('click', function() {
        const notificationId = this.getAttribute('data-notification-id');
        
        if (notificationId) {
            closeNotificationDetailsModal();
            openAcceptTaskModal(notificationId);
        }
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === acceptTaskModal) {
            closeAcceptTaskModal();
        }
        if (event.target === notificationDetailsModal) {
            closeNotificationDetailsModal();
        }
    });
    
    function openAcceptTaskModal(notificationId) {
        // Set the notification ID on the confirm button
        confirmAcceptBtn.setAttribute('data-notification-id', notificationId);
        
        // Show the modal
        acceptTaskModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeAcceptTaskModal() {
        acceptTaskModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function showNotificationDetails(notificationId, type) {
        // Set the notification ID on the action button
        takeActionBtn.setAttribute('data-notification-id', notificationId);
        
        // Update modal content based on notification type
        const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
        const status = notificationItem.getAttribute('data-status');
        
        // Update main details
        document.getElementById('detailTitle').textContent = 'Notification Details';
        document.getElementById('detailIcon').innerHTML = `<i class="fas fa-${notificationItem.querySelector('.notification-icon i').className.split(' ')[1]}"></i>`;
        document.getElementById('detailNotificationTitle').textContent = notificationItem.querySelector('.notification-title-text').textContent.replace('✓ Accepted', '').replace('✗ Declined', '').trim();
        document.getElementById('detailMessage').textContent = notificationItem.querySelector('.notification-message').textContent;
        document.getElementById('detailTime').innerHTML = notificationItem.querySelector('.notification-time').innerHTML;
        
        // Update additional info based on type
        const additionalInfo = document.getElementById('detailAdditionalInfo');
        
        if (type === 'assignment') {
            additionalInfo.innerHTML = `
                <h3>Assignment Details</h3>
                <p><strong>Vehicle:</strong> Toyota Land Cruiser (KAB 456B)</p>
                <p><strong>Task Type:</strong> Brake System Check</p>
                <p><strong>Location:</strong> Municipal Garage</p>
                <p><strong>Scheduled Date:</strong> June 17, 2025</p>
                <p><strong>Estimated Duration:</strong> 2 hours</p>
            `;
            
            if (status === 'pending') {
                takeActionBtn.textContent = 'Accept Assignment';
                takeActionBtn.style.display = 'inline-block';
            } else {
                takeActionBtn.style.display = 'none';
            }
        } else if (type === 'vehicle') {
            additionalInfo.innerHTML = `
                <h3>Vehicle Details</h3>
                <p><strong>Vehicle:</strong> Toyota Land Cruiser (KAB 123X)</p>
                <p><strong>Issue:</strong> Routine Maintenance Required</p>
                <p><strong>Service Type:</strong> 125,000 km Service</p>
                <p><strong>Due Date:</strong> June 25, 2025</p>
                <p><strong>Current Mileage:</strong> 124,567 km</p>
            `;
            takeActionBtn.textContent = 'Schedule Service';
            takeActionBtn.style.display = 'inline-block';
        } else {
            additionalInfo.innerHTML = '<p>No additional information available for this notification.</p>';
            takeActionBtn.style.display = 'none';
        }
        
        // Mark as read if unread
        if (notificationItem.classList.contains('unread')) {
            notificationItem.classList.remove('unread');
            updateUnreadCount();
        }
        
        // Show the modal
        notificationDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeNotificationDetailsModal() {
        notificationDetailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Update unread count badge
    function updateUnreadCount() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        unreadCountBadge.textContent = unreadCount;
        
        if (unreadCount === 0) {
            unreadCountBadge.style.display = 'none';
            markAllReadBtn.disabled = true;
            markAllReadBtn.innerHTML = '<i class="fas fa-check-double"></i> All Read';
        } else {
            unreadCountBadge.style.display = 'flex';
            markAllReadBtn.disabled = false;
            markAllReadBtn.innerHTML = '<i class="fas fa-check-double"></i> Mark All as Read';
        }
    }
    
    // Toast notification function
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'var(--primary-color)';
        toast.style.color = 'white';
        toast.style.padding = '12px 25px';
        toast.style.borderRadius = '6px';
        toast.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '1000';
        toast.style.animation = 'fadeIn 0.3s ease-out';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Initialize
    updateUnreadCount();
});