document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailOrPhone = document.getElementById('emailOrPhone').value;
        
        if (!emailOrPhone) {
            alert('Please enter your email or phone number');
            return;
        }
        
        // Here you would typically send the reset request to your server
        console.log('Password reset requested for:', emailOrPhone);
        
        // Show success message (in a real app, this would be after server response)
        showSuccessMessage();
    });
    
    function showSuccessMessage() {
        // In a real implementation, you would replace the form with this:
        const successHTML = `
            <div class="reset-success">
                <div class="icon">✓</div>
                <h2>Reset Link Sent!</h2>
                <p>We've sent a password reset link to your email/phone. Please check your inbox.</p>
                <p>Didn't receive it? <a href="#" id="resend-link">Resend</a></p>
            </div>
            <div class="action-links">
                <a href="login.html" class="back-to-login">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                    Back to Login
                </a>
            </div>
        `;
        
        forgotPasswordForm.innerHTML = successHTML;
        
        // Add resend functionality
        document.getElementById('resend-link')?.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Resending password reset link...');
            // Resend logic would go here
        });
    }
});