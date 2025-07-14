document.addEventListener('DOMContentLoaded', function () {
    // Role-based field toggling
    const roleSelect = document.getElementById('role');
    const driverFields = document.getElementById('driverFields');
    const mechanicFields = document.getElementById('mechanicFields');
  
    roleSelect.addEventListener('change', function () {
      driverFields.classList.add('hidden');
      mechanicFields.classList.add('hidden');
  
      if (this.value === 'driver') {
        driverFields.classList.remove('hidden');
      } else if (this.value === 'mechanic') {
        mechanicFields.classList.remove('hidden');
      }
    });
  
    // Initialize fields based on any preselected role
    if (roleSelect.value === 'driver') {
      driverFields.classList.remove('hidden');
    } else if (roleSelect.value === 'mechanic') {
      mechanicFields.classList.remove('hidden');
    }
  
    // Password validation functionality
    const pwd = document.getElementById('password');
    const confirmPwd = document.getElementById('confirmPassword');
  
    // Create password visibility toggle
    const eye = document.createElement('span');
    eye.textContent = '👁️';
    eye.style.cursor = 'pointer';
    eye.style.marginLeft = '8px';
    eye.onclick = () => {
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      confirmPwd.type = confirmPwd.type === 'password' ? 'text' : 'password';
    };
    pwd.parentElement.appendChild(eye);
  
    // Create password requirements checklist
    const checklist = document.createElement('ul');
    checklist.innerHTML = `
      <li id="chk1">Min 8 chars</li>
      <li id="chk2">1 uppercase</li>
      <li id="chk3">1 lowercase</li>
      <li id="chk4">1 number</li>
      <li id="chk5">1 special (@$!%*?&)</li>
    `;
    checklist.style.listStyle = 'none';
    pwd.parentElement.appendChild(checklist);
  
    // Password validation rules
    const rules = {
      chk1: /.{8,}/,
      chk2: /[A-Z]/,
      chk3: /[a-z]/,
      chk4: /\d/,
      chk5: /[@$!%*?&]/,
    };
  
    // Validate password against rules
    pwd.addEventListener('input', () => {
      const val = pwd.value;
      for (const id in rules) {
        const li = document.getElementById(id);
        li.style.color = rules[id].test(val) ? 'green' : 'red';
      }
    });
  
    // Confirm password match
    confirmPwd.addEventListener('input', () => {
      const match = confirmPwd.value === pwd.value;
      confirmPwd.style.borderColor = match ? 'green' : 'red';
    });
  });