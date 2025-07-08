document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('expanded');
        this.classList.toggle('active');
    });

    // Settings menu navigation
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            document.querySelectorAll('.settings-menu-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.settings-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).style.display = 'block';
        });
    });

    // Initialize the first section as active
    document.getElementById('profile-section').style.display = 'block';

    // Team Management Functionality
    let teamMembers = [
        {
            id: 1,
            name: "John Kamau",
            email: "john.kamau@muranga.go.ke",
            role: "Fleet Supervisor",
            status: "Active"
        },
        {
            id: 2,
            name: "Mary Wanjiku",
            email: "mary.wanjiku@muranga.go.ke",
            role: "Maintenance Coordinator",
            status: "Active"
        },
        {
            id: 3,
            name: "Peter Otieno",
            email: "peter.otieno@muranga.go.ke",
            role: "Driver Manager",
            status: "Inactive"
        }
    ];

    // Modal elements
    const addMemberModal = document.getElementById('addMemberModal');
    const editMemberModal = document.getElementById('editMemberModal');
    const deleteMemberModal = document.getElementById('deleteMemberModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Form elements
    const addMemberForm = document.getElementById('addMemberForm');
    const editMemberForm = document.getElementById('editMemberForm');
    
    // Add Member functionality
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        addMemberModal.classList.add('active');
        addMemberForm.reset();
    });
    
    document.getElementById('cancelAddMember').addEventListener('click', () => {
        addMemberModal.classList.remove('active');
    });
    
    document.getElementById('confirmAddMember').addEventListener('click', () => {
        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;
        const role = document.getElementById('memberRole').value;
        
        if (name && email && role) {
            const newMember = {
                id: teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.id)) + 1 : 1,
                name,
                email,
                role,
                status: "Active"
            };
            
            teamMembers.push(newMember);
            renderTeamMembers();
            addMemberModal.classList.remove('active');
            showToast('Team member added successfully');
        } else {
            alert('Please fill all required fields');
        }
    });
    
    // Edit Member functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-member') || e.target.parentElement.classList.contains('edit-member')) {
            const row = e.target.closest('tr');
            const memberId = parseInt(row.getAttribute('data-member-id'));
            const member = teamMembers.find(m => m.id === memberId);
            
            if (member) {
                document.getElementById('editMemberId').value = member.id;
                document.getElementById('editMemberName').value = member.name;
                document.getElementById('editMemberEmail').value = member.email;
                document.getElementById('editMemberRole').value = member.role;
                document.getElementById('editMemberStatus').value = member.status;
                
                editMemberModal.classList.add('active');
            }
        }
    });
    
    document.getElementById('cancelEditMember').addEventListener('click', () => {
        editMemberModal.classList.remove('active');
    });
    
    document.getElementById('saveMemberChanges').addEventListener('click', () => {
        const memberId = parseInt(document.getElementById('editMemberId').value);
        const name = document.getElementById('editMemberName').value;
        const email = document.getElementById('editMemberEmail').value;
        const role = document.getElementById('editMemberRole').value;
        const status = document.getElementById('editMemberStatus').value;
        
        if (memberId && name && email && role && status) {
            const memberIndex = teamMembers.findIndex(m => m.id === memberId);
            if (memberIndex !== -1) {
                teamMembers[memberIndex] = {
                    ...teamMembers[memberIndex],
                    name,
                    email,
                    role,
                    status
                };
                
                renderTeamMembers();
                editMemberModal.classList.remove('active');
                showToast('Team member updated successfully');
            }
        } else {
            alert('Please fill all required fields');
        }
    });
    
    // Delete Member functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-member') || e.target.parentElement.classList.contains('delete-member')) {
            const row = e.target.closest('tr');
            const memberId = parseInt(row.getAttribute('data-member-id'));
            const member = teamMembers.find(m => m.id === memberId);
            
            if (member) {
                document.getElementById('memberToDelete').textContent = `${member.name} (${member.role})`;
                document.getElementById('confirmDeleteMember').setAttribute('data-member-id', memberId);
                deleteMemberModal.classList.add('active');
            }
        }
    });
    
    document.getElementById('cancelDeleteMember').addEventListener('click', () => {
        deleteMemberModal.classList.remove('active');
    });
    
    document.getElementById('confirmDeleteMember').addEventListener('click', () => {
        const memberId = parseInt(document.getElementById('confirmDeleteMember').getAttribute('data-member-id'));
        
        teamMembers = teamMembers.filter(m => m.id !== memberId);
        renderTeamMembers();
        deleteMemberModal.classList.remove('active');
        showToast('Team member deleted successfully');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            addMemberModal.classList.remove('active');
            editMemberModal.classList.remove('active');
            deleteMemberModal.classList.remove('active');
        }
    });
    
    // Close modals with close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Render team members in the table
    function renderTeamMembers() {
        const tbody = document.getElementById('teamMembersList');
        tbody.innerHTML = '';
        
        teamMembers.forEach(member => {
            const row = document.createElement('tr');
            row.setAttribute('data-member-id', member.id);
            
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.role}</td>
                <td><span class="status-badge ${member.status === 'Active' ? 'status-active' : 'status-inactive'}">${member.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline edit-member"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline delete-member"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        document.getElementById('teamMembersCount').textContent = teamMembers.length;
    }
    
    // Form submission handlers
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Update profile name in the header
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        document.getElementById('profileName').textContent = `${firstName} ${lastName}`;
        showToast('Profile updated successfully');
    });
    
    document.getElementById('securityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Security settings updated successfully');
        this.reset();
    });
    
    document.getElementById('notificationsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Notification preferences saved');
    });
    
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('System preferences saved');
    });
    
    document.getElementById('integrationsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Integration settings updated');
    });
    
    // API Key functionality
    document.getElementById('copyApiKey').addEventListener('click', function() {
        const apiKey = document.getElementById('apiKey');
        apiKey.select();
        document.execCommand('copy');
        showToast('API key copied to clipboard');
    });
    
    document.getElementById('regenerateApiKey').addEventListener('click', function() {
        if (confirm('Are you sure you want to regenerate the API key? All connected services will need to update their configuration.')) {
            const newApiKey = 'mta_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            document.getElementById('apiKey').value = newApiKey;
            showToast('New API key generated');
        }
    });
    
    // Save all settings button
    document.getElementById('saveAllSettings').addEventListener('click', function() {
        showToast('All settings saved successfully');
    });
    
    // Cancel buttons functionality
    document.getElementById('cancelProfileChanges').addEventListener('click', function() {
        document.getElementById('profileForm').reset();
    });
    
    document.getElementById('cancelSecurityChanges').addEventListener('click', function() {
        document.getElementById('securityForm').reset();
    });
    
    document.getElementById('cancelNotificationChanges').addEventListener('click', function() {
        document.getElementById('notificationsForm').reset();
    });
    
    document.getElementById('cancelPreferenceChanges').addEventListener('click', function() {
        document.getElementById('preferencesForm').reset();
    });
    
    document.getElementById('cancelIntegrationChanges').addEventListener('click', function() {
        document.getElementById('integrationsForm').reset();
    });
    
    // Toast notification function
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = 'var(--primary-color)';
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '1000';
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger reflow to enable animation
        void toast.offsetWidth;
        
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Initial render
    renderTeamMembers();
});