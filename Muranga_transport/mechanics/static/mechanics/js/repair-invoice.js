document.addEventListener('DOMContentLoaded', function() {
    const repairForm = document.getElementById('repairForm');
    const receiptsInput = document.getElementById('receipts');

    repairForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Repair invoice submitted successfully!');
        this.reset();
        
        // Reset the file upload label text
        const uploadLabel = receiptsInput.nextElementSibling;
        uploadLabel.querySelector('p').textContent = 'Click to upload or drag and drop';
    });

    receiptsInput.addEventListener('change', function() {
        const label = this.nextElementSibling;
        if (this.files.length > 0) {
            label.querySelector('p').textContent = this.files[0].name;
        } else {
            label.querySelector('p').textContent = 'Click to upload or drag and drop';
        }
    });
});