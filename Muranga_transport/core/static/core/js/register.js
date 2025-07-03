document.addEventListener('DOMContentLoaded', function () {
    const roleSelect = document.getElementById('role');
    const driverFields = document.getElementById('driverFields');
    const mechanicFields = document.getElementById('mechanicFields');
    const signupForm = document.getElementById('signupForm');

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // === Role switching ===
    roleSelect.addEventListener('change', function () {
        const role = this.value;

        driverFields.style.display = 'none';
        mechanicFields.style.display = 'none';

        driverFields.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
        mechanicFields.querySelectorAll('input').forEach(i => i.removeAttribute('required'));

        if (role === 'driver') {
            driverFields.style.display = 'block';
            driverFields.querySelectorAll('input').forEach(i => i.setAttribute('required', ''));
        } else if (role === 'mechanic') {
            mechanicFields.style.display = 'block';
            mechanicFields.querySelectorAll('input').forEach(i => i.setAttribute('required', ''));
        }
    });

    // === Password checklist ===
    const checklist = document.createElement('ul');
    checklist.innerHTML = `
        <li id="chk-length">At least 8 characters</li>
        <li id="chk-uppercase">At least 1 uppercase letter</li>
        <li id="chk-lowercase">At least 1 lowercase letter</li>
        <li id="chk-number">At least 1 number</li>
        <li id="chk-special">At least 1 special (@$!%*?&)</li>
    `;
    checklist.style.listStyle = 'none';
    checklist.style.paddingLeft = '0';
    passwordInput.parentElement.appendChild(checklist);

    const rules = {
        'chk-length': /.{8,}/,
        'chk-uppercase': /[A-Z]/,
        'chk-lowercase': /[a-z]/,
        'chk-number': /[0-9]/,
        'chk-special': /[@$!%*?&]/
    };

    passwordInput.addEventListener('input', function () {
        const val = passwordInput.value;
        for (let id in rules) {
            const li = document.getElementById(id);
            if (rules[id].test(val)) {
                li.style.color = 'green';
            } else {
                li.style.color = 'red';
            }
        }
    });

    // === Password match check ===
    const matchMsg = document.createElement('div');
    matchMsg.style.fontSize = '0.9em';
    confirmPasswordInput.parentElement.appendChild(matchMsg);

    function checkMatch() {
        if (confirmPasswordInput.value === "") {
            matchMsg.textContent = "";
        } else if (confirmPasswordInput.value === passwordInput.value) {
            matchMsg.textContent = "✅ Passwords match";
            matchMsg.style.color = 'green';
        } else {
            matchMsg.textContent = "❌ Passwords do not match";
            matchMsg.style.color = 'red';
        }
    }

    passwordInput.addEventListener('input', checkMatch);
    confirmPasswordInput.addEventListener('input', checkMatch);

    // === Toggle eye icons ===
    const addToggleEye = (input) => {
        const icon = document.createElement('span');
        icon.textContent = '👁️';
        icon.style.cursor = 'pointer';
        icon.style.marginLeft = '8px';
        icon.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
        input.parentElement.appendChild(icon);
    };
    addToggleEye(passwordInput);
    addToggleEye(confirmPasswordInput);

    // === Submit handler ===
    signupForm.addEventListener('submit', function (e) {
        const val = passwordInput.value;
        let valid = true;

        for (let id in rules) {
            if (!rules[id].test(val)) {
                valid = false;
                break;
            }
        }

        if (!valid) {
            alert('Your password does not meet all requirements.');
            e.preventDefault();
            return;
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Passwords do not match.');
            e.preventDefault();
            return;
        }

        if (!document.getElementById('terms').checked) {
            alert('Please accept the terms and conditions.');
            e.preventDefault();
            return;
        }

        // Else: let form submit naturally
    });
});
