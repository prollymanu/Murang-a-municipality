document.addEventListener('DOMContentLoaded', function() {
    // Notification data
    const notifications = [
        {
            id: 1,
            icon: 'check-circle',
            title: 'Invoice Approved',
            message: 'Your repair invoice #INV-2023-015 has been approved',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            icon: 'tools',
            title: 'New Task Assigned',
            message: 'Vehicle #KAB 456B - Brake System Check has been assigned to you',
            time: 'Yesterday, 3:45 PM',
            read: false
        },
        {
            id: 3,
            icon: 'calendar-alt',
            title: 'Performance Review',
            message: 'Your performance review has been scheduled for Friday, 10:00 AM',
            time: 'June 25, 2023',
            read: true
        },
        {
            id: 4,
            icon: 'exclamation-circle',
            title: 'Urgent Repair',
            message: 'Emergency repair needed for ambulance KAB 789X',
            time: 'Today, 8:30 AM',
            read: false
        },
        {
            id: 5,
            icon: 'thumbs-up',
            title: 'Job Completed',
            message: 'Your completed job #JOB-2023-142 has been rated 5 stars',
            time: 'June 20, 2023',
            read: true
        }
    ];

    // DOM Elements
    const notificationList = document.getElementById('notificationList');
    const unreadCountBadge = document.getElementById('unreadCount');
    const markAllReadBtn = document.getElementById('markAllRead');

    // Initialize notifications
    renderNotifications();
    updateUnreadCount();

    // Mark all as read button
    markAllReadBtn.addEventListener('click', function() {
        notifications.forEach(notification => {
            notification.read = true;
        });
        renderNotifications();
        updateUnreadCount();
        showToast('All notifications marked as read');
    });

    // Render notifications
    function renderNotifications() {
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No notifications available</div>';
            return;
        }

        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title-text">
                        ${notification.title}
                        ${!notification.read ? '<span class="notification-badge"></span>' : ''}
                    </div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = parseInt(this.getAttribute('data-id'));
                const notification = notifications.find(n => n.id === notificationId);
                
                if (notification && !notification.read) {
                    notification.read = true;
                    renderNotifications(); // Re-render to update the UI
                    updateUnreadCount();
                    
                    // Show notification details
                    showNotificationDetails(notification);
                }
            });
        });
    }

    // Show notification details
    function showNotificationDetails(notification) {
        alert(`Notification Details:\n\nTitle: ${notification.title}\n\nMessage: ${notification.message}\n\nTime: ${notification.time}`);
    }

    // Update unread count badge
    function updateUnreadCount() {
        const unreadCount = notifications.filter(n => !n.read).length;
        unreadCountBadge.textContent = unreadCount;
        
        if (unreadCount === 0) {
            unreadCountBadge.style.display = 'none';
            markAllReadBtn.disabled = true;
            markAllReadBtn.style.opacity = '0.7';
        } else {
            unreadCountBadge.style.display = 'flex';
            markAllReadBtn.disabled = false;
            markAllReadBtn.style.opacity = '1';
        }
    }

    // Helper function to show toast notifications
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'var(--black)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '1000';
        toast.style.animation = 'fadeIn 0.3s';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Add animation for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
});