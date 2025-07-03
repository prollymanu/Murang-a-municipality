document.addEventListener('DOMContentLoaded', function() {
    // Notification data
    const notifications = [
        {
            id: 1,
            icon: 'check-circle',
            title: 'Your trip log for June 12 has been approved',
            time: '3 hours ago',
            read: false,
            type: 'trip',
            accepted: false
        },
        {
            id: 2,
            icon: 'calendar-alt',
            title: 'New task assigned: Vehicle #KAB 456B - Brake System Check',
            time: 'Yesterday, 3:45 PM',
            read: false,
            type: 'assignment',
            accepted: false
        },
        {
            id: 3,
            icon: 'car',
            title: 'Your assigned vehicle needs routine service',
            time: 'June 10, 2025',
            read: true,
            type: 'maintenance',
            accepted: false
        }
    ];

    // DOM Elements
    const notificationBadge = document.getElementById('notificationBadge');
    const seeAllLink = document.getElementById('seeAllNotifications');
    const reportModal = document.getElementById('reportModal');
    const acceptTaskModal = document.getElementById('acceptTaskModal');
    const reportBtns = document.querySelectorAll('.vehicle-actions button');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelReport');
    const reportForm = document.getElementById('reportForm');
    const cancelAcceptBtn = document.getElementById('cancelAcceptTask');
    const confirmAcceptBtn = document.getElementById('confirmAcceptTask');

    // Initialize
    setupNotifications();
    setupReportModal();
    setupAcceptTaskModal();

    // Notification functions
    function setupNotifications() {
        // Mark notifications as read when clicked
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // Don't trigger if clicking on a button
                if (e.target.tagName === 'BUTTON') return;
                
                const notificationId = parseInt(this.getAttribute('data-id'));
                const notification = notifications.find(n => n.id === notificationId);
                
                if (notification && !notification.read) {
                    notification.read = true;
                    this.classList.remove('unread');
                    updateNotificationBadge();
                }
                
                showNotificationDetails(notification);
            });
        });

        // View Details buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const notificationId = parseInt(this.closest('.notification-item').getAttribute('data-id'));
                const notification = notifications.find(n => n.id === notificationId);
                showNotificationDetails(notification);
            });
        });

        // Accept Task buttons
        document.querySelectorAll('.accept-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const notificationItem = this.closest('.notification-item');
                const notificationId = parseInt(notificationItem.getAttribute('data-id'));
                const notification = notifications.find(n => n.id === notificationId);
                
                // Show the accept task modal
                openAcceptTaskModal(notification, notificationItem);
            });
        });

        updateNotificationBadge();
    }

    function updateNotificationBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;
        if (notificationBadge) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    function showNotificationDetails(notification) {
        let message = `Notification Details:\n\nTitle: ${notification.title}\nTime: ${notification.time}\nStatus: ${notification.read ? 'Read' : 'Unread'}`;
        
        if (notification.type === 'trip') {
            message += '\n\nThis is a trip log notification.';
        } else if (notification.type === 'assignment') {
            message += '\n\nThis is an assignment notification.';
            if (notification.accepted) {
                message += '\nStatus: Accepted';
            }
        } else if (notification.type === 'maintenance') {
            message += '\n\nThis is a vehicle maintenance notification.';
        }
        
        alert(message);
    }

    // Accept Task Modal functions
    function setupAcceptTaskModal() {
        // Close modal buttons
        cancelAcceptBtn.addEventListener('click', closeAcceptTaskModal);
        
        // Confirm button
        confirmAcceptBtn.addEventListener('click', function() {
            const notificationId = parseInt(this.getAttribute('data-notification-id'));
            const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            
            if (notificationItem) {
                const notification = notifications.find(n => n.id === notificationId);
                
                // Mark as accepted
                notification.accepted = true;
                notificationItem.setAttribute('data-accepted', 'true');
                
                // Remove accept button
                const acceptBtn = notificationItem.querySelector('.accept-btn');
                if (acceptBtn) acceptBtn.remove();
                
                // Add accepted status
                const contentDiv = notificationItem.querySelector('.notification-content');
                const statusDiv = document.createElement('div');
                statusDiv.className = 'notification-status';
                statusDiv.innerHTML = '<span style="color:#388e3c;">✓ Accepted</span>';
                contentDiv.appendChild(statusDiv);
                
                // Mark as read
                notification.read = true;
                notificationItem.classList.remove('unread');
                
                // Update notification count
                updateNotificationBadge();
                
                // Close modal
                closeAcceptTaskModal();
                
                // Show success message
                alert(`You have successfully accepted the task: "${notification.title}"`);
            }
        });
    }

    function openAcceptTaskModal(notification, notificationItem) {
        // Set the notification ID on the confirm button
        confirmAcceptBtn.setAttribute('data-notification-id', notification.id);
        
        // Show the modal
        acceptTaskModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeAcceptTaskModal() {
        acceptTaskModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Report Modal functions
    function setupReportModal() {
        // Open modal when report buttons are clicked
        reportBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                openModal();
            });
        });
        
        // Close modal
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === reportModal) {
                closeModal();
            }
            if (event.target === acceptTaskModal) {
                closeAcceptTaskModal();
            }
        });
        
        // Form submission
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Vehicle issue report submitted successfully!');
            closeModal();
            reportForm.reset();
        });
    }

    function openModal() {
        reportModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        reportModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});