document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Filter functionality
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const searchInput = document.getElementById('searchRequests');
    const requestsList = document.getElementById('requestsList');
    const noRequests = document.getElementById('noRequests');
    const requestCards = document.querySelectorAll('.request-card');
    
    function filterRequests() {
        const statusFilter = filterStatus.value;
        const typeFilter = filterType.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        let visibleCount = 0;
        
        requestCards.forEach(card => {
            const status = card.classList.contains('pending') ? 'pending' : 
                         card.classList.contains('urgent') ? 'urgent' : 
                         card.classList.contains('resolved') ? 'resolved' :
                         card.classList.contains('provisioning') ? 'provisioning' : '';
            
            const type = card.querySelector('.request-meta span:first-child').textContent.toLowerCase();
            const isDriver = type.includes('driver');
            const isMechanic = type.includes('mechanic');
            
            const title = card.querySelector('.request-title').textContent.toLowerCase();
            const content = card.querySelector('.request-content').textContent.toLowerCase();
            
            const statusMatch = statusFilter === 'all' || status === statusFilter;
            const typeMatch = typeFilter === 'all' || 
                              (typeFilter === 'driver' && isDriver) || 
                              (typeFilter === 'mechanic' && isMechanic);
            const searchMatch = searchTerm === '' || 
                               title.includes(searchTerm) || 
                               content.includes(searchTerm);
            
            if (statusMatch && typeMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (visibleCount === 0) {
            requestsList.style.display = 'none';
            noRequests.style.display = 'block';
        } else {
            requestsList.style.display = 'block';
            noRequests.style.display = 'none';
        }
    }
    
    // Add event listeners for filters
    filterStatus.addEventListener('change', filterRequests);
    filterType.addEventListener('change', filterRequests);
    searchInput.addEventListener('input', filterRequests);
    
    // Refresh button
    document.getElementById('refreshRequests').addEventListener('click', function() {
        // In a real application, this would reload data from the server
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            filterRequests();
        }, 1000);
    });
    
    // Toggle request details when clicking on a request card
    requestCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't toggle if clicking on a button or form element
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || 
                e.target.closest('button') || e.target.closest('textarea')) {
                return;
            }
            
            // Close all other expanded cards
            document.querySelectorAll('.request-card.expanded').forEach(expandedCard => {
                if (expandedCard !== this) {
                    expandedCard.classList.remove('expanded');
                }
            });
            
            // Toggle this card
            this.classList.toggle('expanded');
        });
    });
    
    // Mark as resolved buttons
    document.querySelectorAll('.mark-resolved').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.request-card');
            card.classList.remove('pending', 'urgent', 'provisioning');
            card.classList.add('resolved');
            
            // Update status badge
            const badge = card.querySelector('.status-badge');
            badge.className = 'status-badge status-resolved';
            badge.innerHTML = '<i class="fas fa-check"></i> Resolved';
            
            // In a real application, this would send an update to the server
            alert('Request marked as resolved');
        });
    });
    
    // Mark as provisioning buttons
    document.querySelectorAll('.mark-provisioning').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.request-card');
            card.classList.remove('pending', 'urgent', 'resolved');
            card.classList.add('provisioning');
            
            // Update status badge
            const badge = card.querySelector('.status-badge');
            badge.className = 'status-badge status-provisioning';
            badge.innerHTML = '<i class="fas fa-cogs"></i> Provisioning';
            
            // In a real application, this would send an update to the server
            alert('Request marked as provisioning');
        });
    });
    
    // Submit response forms
    document.querySelectorAll('.send-response').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const form = this.closest('.response-form');
            const textarea = form.querySelector('textarea');
            const response = textarea.value.trim();
            
            if (response === '') {
                alert('Please enter a response before submitting');
                return;
            }
            
            // In a real application, this would send the response to the server
            alert('Response submitted successfully');
            textarea.value = '';
        });
    });
    
    // Cancel response buttons
    document.querySelectorAll('.cancel-response').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const form = this.closest('.response-form');
            form.querySelector('textarea').value = '';
        });
    });
});