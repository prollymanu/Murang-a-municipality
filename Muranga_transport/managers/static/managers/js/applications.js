document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        showTab(tabId);
      });
    });
  
    function showTab(tabId) {
      // Hide all tabs and remove active class
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Show selected tab and content
      document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }
  
    // Modal functions
    function openDenyModal(requestId) {
      document.getElementById('modalRequestId').textContent = requestId;
      document.getElementById('denyRequestForm').action = `/managers/applications/${requestId}/deny/`;
      document.getElementById('denyRequestModal').classList.add('show');
      document.getElementById('denyReason').focus();
    }
  
    function closeDenyModal() {
      document.getElementById('denyRequestModal').classList.remove('show');
      document.getElementById('denyReason').value = '';
      document.getElementById('modalRequestId').textContent = '0';
      document.getElementById('denyRequestForm').action = '';
    }
  
    function openAddDriverModal() {
      document.getElementById('addDriverModal').classList.add('show');
      document.getElementById('driverFirstName').focus();
    }
  
    function closeAddDriverModal() {
      document.getElementById('addDriverModal').classList.remove('show');
      document.getElementById('driverForm').reset();
    }
  
    function openAddMechanicModal() {
      document.getElementById('addMechanicModal').classList.add('show');
      document.getElementById('mechanicFirstName').focus();
    }
  
    function closeAddMechanicModal() {
      document.getElementById('addMechanicModal').classList.remove('show');
      document.getElementById('mechanicForm').reset();
    }
  
    // Close modals when clicking outside
    window.onclick = function(event) {
      const denyModal = document.getElementById('denyRequestModal');
      const driverModal = document.getElementById('addDriverModal');
      const mechanicModal = document.getElementById('addMechanicModal');
      
      if (event.target === denyModal) closeDenyModal();
      if (event.target === driverModal) closeAddDriverModal();
      if (event.target === mechanicModal) closeAddMechanicModal();
    };
  
    // Form validation
    document.getElementById('denyRequestForm')?.addEventListener('submit', function(event) {
      const denyReason = document.getElementById('denyReason').value.trim();
      if (!denyReason) {
        event.preventDefault();
        alert('Please provide a reason for denying the request.');
      }
    });
  
    document.getElementById('driverForm')?.addEventListener('submit', function(event) {
      const password = document.getElementById('driverPassword').value;
      const confirmPassword = document.getElementById('driverConfirmPassword').value;
      const license = document.getElementById('driverLicense').value;
      const licenseClass = document.getElementById('driverLicenseClass').value;
      const experience = document.getElementById('driverExperience').value;
  
      if (!license || !licenseClass) {
        event.preventDefault();
        alert("Driver's license number and license class are required.");
        return;
      }
      if (experience < 0) {
        event.preventDefault();
        alert('Experience years must be a non-negative number.');
        return;
      }
      if (password !== confirmPassword) {
        event.preventDefault();
        alert('Passwords do not match.');
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        event.preventDefault();
        alert('Password must be at least 8 characters long, with an uppercase letter, lowercase letter, number, and special character.');
        return;
      }
    });
  
    document.getElementById('mechanicForm')?.addEventListener('submit', function(event) {
      const password = document.getElementById('mechanicPassword').value;
      const confirmPassword = document.getElementById('mechanicConfirmPassword').value;
      const idNumber = document.getElementById('mechanicIdNumber').value;
      const experience = document.getElementById('mechanicExperience').value;
  
      if (!idNumber) {
        event.preventDefault();
        alert('ID number is required for mechanics.');
        return;
      }
      if (experience < 0) {
        event.preventDefault();
        alert('Experience years must be a non-negative number.');
        return;
      }
      if (password !== confirmPassword) {
        event.preventDefault();
        alert('Passwords do not match.');
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        event.preventDefault();
        alert('Password must be at least 8 characters long, with an uppercase letter, lowercase letter, number, and special character.');
        return;
      }
    });
  
    // Search and filter functionality
    const setupSearchFilter = (inputId, paramName) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', function() {
          const url = new URL(window.location);
          url.searchParams.set(paramName, this.value);
          url.searchParams.delete('page');
          window.location = url;
        });
      }
    };
  
    const setupSelectFilter = (selectId, paramName) => {
      const select = document.getElementById(selectId);
      if (select) {
        select.addEventListener('change', function() {
          const url = new URL(window.location);
          url.searchParams.set(paramName, this.value);
          url.searchParams.delete('page');
          window.location = url;
        });
      }
    };
  
    // Setup all search and filter inputs
    setupSearchFilter('applicationSearch', 'q');
    setupSelectFilter('applicationTypeFilter', 'role');
    setupSearchFilter('driverSearch', 'q');
    setupSelectFilter('driverStatusFilter', 'status');
    setupSelectFilter('driverLicenseFilter', 'license');
    setupSearchFilter('mechanicSearch', 'q');
    setupSelectFilter('mechanicStatusFilter', 'status');
    setupSelectFilter('mechanicSpecialtyFilter', 'specialty');
  
    // Initialize modal buttons
    document.querySelectorAll('[onclick^="open"]').forEach(button => {
      const funcName = button.getAttribute('onclick').match(/open\w+Modal/)[0];
      button.addEventListener('click', () => window[funcName]());
    });
  });