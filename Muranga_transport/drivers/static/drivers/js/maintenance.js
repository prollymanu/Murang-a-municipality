document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const modal = document.getElementById('requestModal');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelRequest');
    
    function openModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    newRequestBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Form submission
    const maintenanceForm = document.getElementById('maintenanceForm');
    maintenanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Maintenance request submitted successfully!');
        closeModal();
        maintenanceForm.reset();
    });
});