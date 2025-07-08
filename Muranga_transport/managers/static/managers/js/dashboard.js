// Toggle sidebar
document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
});

// Quick Assign Button functionality
document.getElementById('quickAssignBtn').addEventListener('click', function() {
    // In a real implementation, this would open a modal or navigate to assignments page
    window.location.href = 'assignments.html?quick=true';
});

// Initialize Fleet Status Chart
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('fleetStatusChart').getContext('2d');
    const fleetStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Operational', 'Maintenance', 'Out of Service', 'Assigned'],
            datasets: [{
                data: [20, 2, 1, 3],
                backgroundColor: [
                    'rgba(46, 125, 50, 0.8)',
                    'rgba(255, 160, 0, 0.8)',
                    'rgba(211, 47, 47, 0.8)',
                    'rgba(25, 118, 210, 0.8)'
                ],
                borderColor: [
                    'rgba(46, 125, 50, 1)',
                    'rgba(255, 160, 0, 1)',
                    'rgba(211, 47, 47, 1)',
                    'rgba(25, 118, 210, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Add click event to quick links
    document.querySelectorAll('.quick-link').forEach(link => {
        link.addEventListener('click', function() {
            // Animation effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Add click event to maintenance alert buttons
    document.querySelectorAll('.alert-actions .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent;
            const alertTitle = this.closest('.alert-item').querySelector('.alert-title').textContent;
            alert(`Action: ${action} for ${alertTitle}`);
            // In a real app, this would trigger the appropriate action
        });
    });
});