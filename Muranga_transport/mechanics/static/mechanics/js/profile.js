document.addEventListener('DOMContentLoaded', function() {
    // Profile picture elements
    const profilePictureContainer = document.querySelector('.profile-picture-container');
    const profilePictureEdit = document.querySelector('.profile-picture-edit');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const sidebarProfilePicture = document.querySelector('.profile-sidebar .profile-picture');
    
    // Make fields readonly
    const readonlyFields = ['email', 'department', 'supervisor'];
    readonlyFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.readOnly = true;
            field.classList.add('readonly-field');
        }
    });

    // Profile picture editing
    profilePictureEdit.addEventListener('click', function() {
        profilePictureInput.click();
    });
    
    profilePictureInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Update preview in modal
                profileImagePreview.src = event.target.result;
                
                // Update profile picture in sidebar (would update main profile in real app)
                sidebarProfilePicture.src = event.target.result;
                
                // In a real application, you would upload the image to the server here
                console.log('New profile picture selected:', e.target.files[0]);
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Get modal elements
    const modal = document.getElementById('editProfileModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelEdit');
    
    // Form elements
    const profileForm = document.getElementById('profileForm');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const newSkillInput = document.getElementById('newSkill');
    const editSkillsList = document.getElementById('editSkillsList');
    
    // Display elements
    const displayElements = {
        fullname: document.getElementById('display-fullname'),
        dob: document.getElementById('display-dob'),
        phone: document.getElementById('display-phone'),
        email: document.getElementById('display-email'),
        specialization: document.getElementById('display-specialization'),
        experience: document.getElementById('display-experience'),
        department: document.getElementById('display-department'),
        supervisor: document.getElementById('display-supervisor'),
        skills: document.getElementById('display-skills')
    };
    
    // Current skills array
    let currentSkills = ['Engine Repair', 'Electrical Systems', 'Diagnostics', 'ASE Certified', 'Brake Systems', 'HVAC'];
    
    // Open modal
    openBtn.addEventListener('click', function() {
        // Populate skills in the edit list
        renderSkillsList();
        modal.style.display = 'block';
    });
    
    // Close modal
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Add new skill
    addSkillBtn.addEventListener('click', function() {
        const skillText = newSkillInput.value.trim();
        if (skillText && !currentSkills.includes(skillText)) {
            currentSkills.push(skillText);
            renderSkillsList();
            newSkillInput.value = '';
        }
    });
    
    // Allow adding skill with Enter key
    newSkillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkillBtn.click();
        }
    });
    
    // Render skills in the edit list
    function renderSkillsList() {
        editSkillsList.innerHTML = '';
        currentSkills.forEach(skill => {
            const skillTag = document.createElement('div');
            skillTag.className = 'edit-skill-tag';
            skillTag.innerHTML = `
                ${skill}
                <span class="remove-skill" data-skill="${skill}">&times;</span>
            `;
            editSkillsList.appendChild(skillTag);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', function() {
                const skillToRemove = this.getAttribute('data-skill');
                currentSkills = currentSkills.filter(skill => skill !== skillToRemove);
                renderSkillsList();
            });
        });
    }
    
    // Form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const firstname = document.getElementById('firstname').value;
        const middlename = document.getElementById('middlename').value;
        const lastname = document.getElementById('lastname').value;
        const dob = document.getElementById('dob').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const specialization = document.getElementById('specialization').value;
        const experience = document.getElementById('experience').value;
        const department = document.getElementById('department').value;
        const supervisor = document.getElementById('supervisor').value;
        
        // Update display
        displayElements.fullname.textContent = `${firstname} ${middlename} ${lastname}`;
        displayElements.dob.textContent = dob;
        displayElements.phone.textContent = phone;
        displayElements.email.textContent = email;
        displayElements.specialization.textContent = specialization;
        displayElements.experience.textContent = `${experience} years`;
        displayElements.department.textContent = department;
        displayElements.supervisor.textContent = supervisor;
        
        // Update skills display
        displayElements.skills.innerHTML = '';
        currentSkills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            displayElements.skills.appendChild(skillTag);
        });
        
        // In a real application, you would send this data to the server here
        console.log('Profile updated:', {
            firstname, middlename, lastname, dob, phone, email,
            specialization, experience, department, supervisor,
            skills: currentSkills
        });
        
        // Close modal
        closeModal();
        
        // Show success message
        alert('Profile updated successfully!');
    });
    
    // Initialize skills list
    renderSkillsList();
});