document.addEventListener('DOMContentLoaded', function () {
    const pwd = document.getElementById('password');
    const confirmPwd = document.getElementById('confirmPassword');

    const eye = document.createElement('span');
    eye.textContent = '👁️';
    eye.style.cursor = 'pointer';
    eye.style.marginLeft = '8px';
    eye.onclick = () => {
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
        confirmPwd.type = confirmPwd.type === 'password' ? 'text' : 'password';
    };
    pwd.parentElement.appendChild(eye);

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

    const rules = {
        chk1: /.{8,}/,
        chk2: /[A-Z]/,
        chk3: /[a-z]/,
        chk4: /\d/,
        chk5: /[@$!%*?&]/,
    };

    pwd.addEventListener('input', () => {
        const val = pwd.value;
        for (const id in rules) {
            const li = document.getElementById(id);
            li.style.color = rules[id].test(val) ? 'green' : 'red';
        }
    });

    confirmPwd.addEventListener('input', () => {
        const match = confirmPwd.value === pwd.value;
        confirmPwd.style.borderColor = match ? 'green' : 'red';
    });
});

