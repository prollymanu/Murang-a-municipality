document.addEventListener('DOMContentLoaded', function () {
    const pwdField = document.getElementById('password');

    // Eye toggle
    const toggleEye = document.createElement('span');
    toggleEye.textContent = '👁️';
    toggleEye.style.cursor = 'pointer';
    toggleEye.style.marginLeft = '8px';
    toggleEye.onclick = () => {
        pwdField.type = pwdField.type === 'password' ? 'text' : 'password';
    };
    pwdField.parentElement.appendChild(toggleEye);
});
