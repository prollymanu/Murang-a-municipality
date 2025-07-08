document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Priority selection
    const priorityBtns = document.querySelectorAll('.priority-btn');
    const priorityInput = document.getElementById('priority');
    
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const priority = this.getAttribute('data-priority');
            
            // Update visual selection
            priorityBtns.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update hidden input value
            priorityInput.value = priority;
        });
    });
    
    // Skill selection
    const skillTags = document.querySelectorAll('.skill-tag');
    const skillsInput = document.getElementById('required-skills');
    let selectedSkills = [];
    
    skillTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const skill = this.getAttribute('data-skill');
            
            // Toggle selection
            this.classList.toggle('selected');
            
            // Update selected skills array
            if (this.classList.contains('selected')) {
                selectedSkills.push(skill);
            } else {
                selectedSkills = selectedSkills.filter(s => s !== skill);
            }
            
            // Update hidden input value
            skillsInput.value = selectedSkills.join(',');
        });
    });
    
    // Driver selection
    const driverSelect = document.getElementById('driver-select');
    const driverDetails = document.getElementById('driver-details');
    
    driverSelect.addEventListener('change', function() {
        if (this.value) {
            driverDetails.style.display = 'flex';
            // Update driver details
            const driverInfo = driverDetails.querySelector('.driver-info');
            const driverName = this.options[this.selectedIndex].text;
            driverInfo.querySelector('h4').textContent = driverName;
            driverInfo.querySelector('p:first-child').textContent = 'License: ' + 
                (driverName === 'John Kamau' ? 'KJA123456' : 
                 driverName === 'Peter Mwangi' ? 'PMW789012' : 
                 driverName === 'James Ochieng' ? 'JOC345678' : 'DNJ901234');
            driverInfo.querySelector('p:last-child').textContent = 'Phone: ' + 
                (driverName === 'John Kamau' ? '+254 712 345 678' : 
                 driverName === 'Peter Mwangi' ? '+254 723 456 789' : 
                 driverName === 'James Ochieng' ? '+254 734 567 890' : '+254 745 678 901');
        } else {
            driverDetails.style.display = 'none';
        }
    });
    
    // Assignment form submission
    const assignmentForm = document.getElementById('assignmentForm');
    
    assignmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('assignment-title').value;
        const dateTime = document.getElementById('assignment-date').value;
        const driver = document.getElementById('driver-select').value;
        const vehicle = document.getElementById('vehicle-select').value;
        
        if (!title || !dateTime || !driver || !vehicle) {
            alert('Please fill in all required fields');
            return;
        }
        
        // In a real app, this would send the data to the server
        alert('Assignment created successfully!');
        
        // Reset form
        this.reset();
        driverDetails.style.display = 'none';
    });
    
    // Job form submission
    const jobForm = document.getElementById('jobCreationForm');
    
    jobForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate priority selection
        if (!priorityInput.value) {
            alert('Please select a priority level');
            return;
        }
        
        // Validate skills selection
        if (selectedSkills.length === 0) {
            alert('Please select at least one required skill');
            return;
        }
        
        // In a real app, this would send the form data to the server
        alert('Job created successfully!');
        this.reset();
        
        // Reset visual selections
        priorityBtns.forEach(btn => btn.classList.remove('selected'));
        skillTags.forEach(tag => tag.classList.remove('selected'));
        selectedSkills = [];
    });
    
    // Assignment action buttons
    document.querySelectorAll('.edit-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            alert(`Editing assignment ${assignmentId}`);
            // In a real app, this would open an edit form
        });
    });
    
    document.querySelectorAll('.cancel-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            if (confirm('Are you sure you want to cancel this assignment?')) {
                alert(`Assignment ${assignmentId} cancelled`);
                // In a real app, this would send a cancellation request
            }
        });
    });
    
    document.querySelectorAll('.track-location-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            alert(`Tracking location for assignment ${assignmentId}`);
            // In a real app, this would open a tracking map
        });
    });
    
    document.querySelectorAll('.complete-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            if (confirm('Mark this assignment as complete?')) {
                alert(`Assignment ${assignmentId} marked as complete`);
                // In a real app, this would update the assignment status
            }
        });
    });
    
    document.querySelectorAll('.view-log-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            alert(`Viewing trip log for assignment ${assignmentId}`);
            // In a real app, this would open the trip log
        });
    });
    
    document.querySelectorAll('.repeat-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            alert(`Repeating assignment ${assignmentId}`);
            // In a real app, this would clone the assignment
        });
    });
});