document.addEventListener('DOMContentLoaded', function() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
  
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', function() {
        // Just navigate to the dedicated edit page:
        window.location.href = editProfileBtn.getAttribute('data-edit-url');
      });
    }
  });
  
