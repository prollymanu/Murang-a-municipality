document.addEventListener('DOMContentLoaded', function () {
    // SELECT2 Initialization 
    if (window.jQuery && $('#license_class').length) {
      $('#license_class').select2({
        theme: 'bootstrap4',
        placeholder: 'Select license class(es)',
        allowClear: true,
        width: '100%'
      });
    }
  
    // PROFILE IMAGE PREVIEW & CONFIRM 
    const profileInput = document.getElementById('profile_image');
    const previewImg = document.getElementById('profileImagePreview');
    const imageForm = document.getElementById('imageUploadForm');
    const originalSrc = previewImg?.src;
  
    if (profileInput && previewImg && imageForm) {
      profileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
  
        // Validate type
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) {
          alert('Only JPG, PNG, GIF, WEBP images are allowed.');
          this.value = '';
          return;
        }
  
        // Validate size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('Image must be under 2MB.');
          this.value = '';
          return;
        }
  
        // Show preview and confirm
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
  
          setTimeout(() => {
            const confirmUpload = confirm('Do you want to update your profile picture with this image?');
            if (confirmUpload) {
              imageForm.submit();
            } else {
              profileInput.value = '';
              previewImg.src = originalSrc;
            }
          }, 200);
        };
  
        reader.onerror = function () {
          alert('Error reading image file.');
          profileInput.value = '';
        };
  
        reader.readAsDataURL(file);
      });
    }
  
    // PHONE VALIDATION 
    const phoneInput = document.getElementById('phone_number');
    phoneInput?.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 9);
    });
  
    // EXPERIENCE VALIDATION 
    const experienceInput = document.getElementById('experience');
    experienceInput?.addEventListener('input', function () {
      let val = parseInt(this.value, 10);
      if (isNaN(val)) val = 0;
      this.value = Math.max(0, Math.min(50, val));
    });
  
    // FORM VALIDATION
    const profileForm = document.getElementById('profileForm');
    profileForm?.addEventListener('submit', function (e) {
      const fullName = document.getElementById('full_name');
      const emailInput = document.getElementById('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!fullName.value.trim()) {
        alert('Full name is required.');
        fullName.focus();
        e.preventDefault();
        return;
      }
  
      if (phoneInput && phoneInput.value.length !== 9) {
        alert('Enter a valid 9-digit phone number.');
        phoneInput.focus();
        e.preventDefault();
        return;
      }
  
      if (emailInput && !emailRegex.test(emailInput.value)) {
        alert('Enter a valid email address.');
        emailInput.focus();
        e.preventDefault();
        return;
      }
    });
  });
  