// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Select2 for license class multi-select
    if ($('.select2-multiple').length) {
        $('.select2-multiple').select2({
            theme: 'bootstrap4',
            placeholder: "Select license class(es)",
            allowClear: true,
            width: '100%'
        });
    }

    // Phone number input formatting
    const phoneInput = document.getElementById('phone_number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 9 characters (Kenyan phone number without country code)
            if (this.value.length > 9) {
                this.value = this.value.slice(0, 9);
            }
        });
    }

    // Experience years validation
    const experienceInput = document.getElementById('experience');
    if (experienceInput) {
        experienceInput.addEventListener('input', function(e) {
            // Ensure value is within range
            if (this.value < 0) this.value = 0;
            if (this.value > 50) this.value = 50;
        });
    }

    // Form submission handling
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Client-side validation can be added here if needed
            // Framework will handle server-side validation and uploads
        });
    }
});