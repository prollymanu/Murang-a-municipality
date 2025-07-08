document.addEventListener('DOMContentLoaded', function() {
    // Sample data for drivers, mechanics, and applications
    let drivers = [
        {
            id: 'DRV-2023-001',
            firstName: 'John',
            lastName: 'Kamau',
            idNumber: '12345678',
            licenseType: 'BCE',
            licenseExpiry: '2025-12-31',
            phone: '0712345678',
            email: 'john.kamau@example.com',
            address: '123 Main St, Nairobi',
            dateJoined: '2020-01-15',
            status: 'active',
            photo: 'driver1.jpg'
        },
        {
            id: 'DRV-2023-002',
            firstName: 'Mary',
            lastName: 'Wambui',
            idNumber: '23456789',
            licenseType: 'CDE',
            licenseExpiry: '2024-10-15',
            phone: '0723456789',
            email: 'mary.wambui@example.com',
            address: '456 Park Ave, Nakuru',
            dateJoined: '2021-03-20',
            status: 'active',
            photo: 'driver2.jpg'
        }
    ];
    
    let mechanics = [
        {
            id: 'MEC-2023-001',
            firstName: 'Peter',
            lastName: 'Mwangi',
            idNumber: '45678901',
            specialty: 'engine',
            experience: 8,
            phone: '0745678901',
            email: 'peter.mwangi@example.com',
            address: '321 Elm St, Kisumu',
            dateJoined: '2018-05-10',
            status: 'active',
            photo: 'mechanic1.jpg'
        },
        {
            id: 'MEC-2023-002',
            firstName: 'Susan',
            lastName: 'Njeri',
            idNumber: '56789012',
            specialty: 'electrical',
            experience: 5,
            phone: '0756789012',
            email: 'susan.njeri@example.com',
            address: '654 Pine St, Eldoret',
            dateJoined: '2020-07-22',
            status: 'active',
            photo: 'mechanic2.jpg'
        }
    ];
    
    let applications = [
        {
            id: 'APP-2023-001',
            type: 'driver',
            firstName: 'James',
            lastName: 'Odhiambo',
            idNumber: '34567890',
            licenseType: 'B',
            phone: '0734567890',
            email: 'james.odhiambo@example.com',
            dateApplied: '2023-06-10',
            status: 'pending',
            documents: ['license.pdf', 'id_copy.pdf']
        },
        {
            id: 'APP-2023-002',
            type: 'mechanic',
            firstName: 'David',
            lastName: 'Ochieng',
            idNumber: '67890123',
            specialty: 'body',
            experience: 3,
            phone: '0767890123',
            email: 'david.ochieng@example.com',
            dateApplied: '2023-06-15',
            status: 'pending',
            documents: ['certificate.pdf', 'id_copy.pdf']
        }
    ];
    
    // DOM Elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const applicationsList = document.getElementById('applicationsList');
    const driversTableBody = document.getElementById('driversTableBody');
    const mechanicsTableBody = document.getElementById('mechanicsTableBody');
    const addDriverBtn = document.getElementById('addDriverBtn');
    const addMechanicBtn = document.getElementById('addMechanicBtn');
    const exportApplicationsBtn = document.getElementById('exportApplicationsBtn');
    const exportDriversBtn = document.getElementById('exportDriversBtn');
    const exportMechanicsBtn = document.getElementById('exportMechanicsBtn');
    const addDriverModal = document.getElementById('addDriverModal');
    const addMechanicModal = document.getElementById('addMechanicModal');
    const personnelDetailsModal = document.getElementById('personnelDetailsModal');
    const cancelDriverBtn = document.getElementById('cancelDriverBtn');
    const cancelMechanicBtn = document.getElementById('cancelMechanicBtn');
    const closePersonnelModalBtn = document.getElementById('closePersonnelModalBtn');
    const saveDriverBtn = document.getElementById('saveDriverBtn');
    const saveMechanicBtn = document.getElementById('saveMechanicBtn');
    const savePersonnelChangesBtn = document.getElementById('savePersonnelChangesBtn');
    const driverForm = document.getElementById('driverForm');
    const mechanicForm = document.getElementById('mechanicForm');
    
    // Search and filter elements
    const applicationSearch = document.getElementById('applicationSearch');
    const driverSearch = document.getElementById('driverSearch');
    const mechanicSearch = document.getElementById('mechanicSearch');
    const applicationTypeFilter = document.getElementById('applicationTypeFilter');
    const applicationDateFilter = document.getElementById('applicationDateFilter');
    const driverStatusFilter = document.getElementById('driverStatusFilter');
    const driverLicenseFilter = document.getElementById('driverLicenseFilter');
    const mechanicStatusFilter = document.getElementById('mechanicStatusFilter');
    const mechanicSpecialtyFilter = document.getElementById('mechanicSpecialtyFilter');
    
    // Current personnel being viewed/edited
    let currentPersonnel = null;
    let currentPersonnelType = null;
    
    // Initialize the page
    function init() {
        renderApplications();
        renderDriversTable();
        renderMechanicsTable();
        initEventListeners();
    }
    
    // Render applications
    function renderApplications() {
        applicationsList.innerHTML = '';
        
        applications.forEach(application => {
            const card = document.createElement('div');
            card.className = 'application-card';
            card.dataset.id = application.id;
            
            let details = '';
            if (application.type === 'driver') {
                details = `
                    <p><strong>License Type:</strong> ${application.licenseType}</p>
                `;
            } else {
                details = `
                    <p><strong>Specialty:</strong> ${application.specialty.charAt(0).toUpperCase() + application.specialty.slice(1)}</p>
                    <p><strong>Experience:</strong> ${application.experience} years</p>
                `;
            }
            
            card.innerHTML = `
                <div class="application-header">
                    <h4>${application.firstName} ${application.lastName}</h4>
                    <span class="badge ${application.type === 'driver' ? 'badge-primary' : 'badge-warning'}">
                        ${application.type === 'driver' ? 'Driver Application' : 'Mechanic Application'}
                    </span>
                </div>
                <div class="application-meta">
                    <span><i class="fas fa-id-card"></i> ${application.idNumber}</span>
                    <span><i class="fas fa-phone"></i> ${application.phone}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(application.dateApplied)}</span>
                </div>
                ${details}
                <div class="application-meta">
                    <span><i class="fas fa-paperclip"></i> Documents: ${application.documents.join(', ')}</span>
                </div>
                <div class="application-actions">
                    <button class="btn btn-outline btn-sm view-application-btn" data-id="${application.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-success btn-sm approve-application-btn" data-id="${application.id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm reject-application-btn" data-id="${application.id}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
            
            applicationsList.appendChild(card);
        });
    }
    
    // Render drivers table
    function renderDriversTable() {
        driversTableBody.innerHTML = '';
        
        drivers.forEach(driver => {
            const row = document.createElement('tr');
            row.dataset.id = driver.id;
            
            let statusClass = '';
            let statusText = '';
            switch(driver.status) {
                case 'active':
                    statusClass = 'badge-success';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusClass = 'badge-danger';
                    statusText = 'Inactive';
                    break;
                case 'on-leave':
                    statusClass = 'badge-warning';
                    statusText = 'On Leave';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="personnel-info">
                        <img src="${driver.photo}" alt="${driver.firstName} ${driver.lastName}" class="personnel-avatar">
                        <div>
                            <div class="personnel-name">${driver.firstName} ${driver.lastName}</div>
                            <div class="personnel-id">${driver.id}</div>
                        </div>
                    </div>
                </td>
                <td>${driver.idNumber}</td>
                <td><span class="badge badge-primary">${driver.licenseType}</span></td>
                <td>${driver.phone}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(driver.dateJoined)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm view-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm edit-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm delete-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            driversTableBody.appendChild(row);
        });
    }
    
    // Render mechanics table
    function renderMechanicsTable() {
        mechanicsTableBody.innerHTML = '';
        
        mechanics.forEach(mechanic => {
            const row = document.createElement('tr');
            row.dataset.id = mechanic.id;
            
            let statusClass = '';
            let statusText = '';
            switch(mechanic.status) {
                case 'active':
                    statusClass = 'badge-success';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusClass = 'badge-danger';
                    statusText = 'Inactive';
                    break;
                case 'on-leave':
                    statusClass = 'badge-warning';
                    statusText = 'On Leave';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="personnel-info">
                        <img src="${mechanic.photo}" alt="${mechanic.firstName} ${mechanic.lastName}" class="personnel-avatar">
                        <div>
                            <div class="personnel-name">${mechanic.firstName} ${mechanic.lastName}</div>
                            <div class="personnel-id">${mechanic.id}</div>
                        </div>
                    </div>
                </td>
                <td>${mechanic.idNumber}</td>
                <td><span class="badge badge-primary">${mechanic.specialty.charAt(0).toUpperCase() + mechanic.specialty.slice(1)}</span></td>
                <td>${mechanic.phone}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(mechanic.dateJoined)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm view-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm edit-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm delete-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            mechanicsTableBody.appendChild(row);
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Add driver button
        addDriverBtn.addEventListener('click', function() {
            driverForm.reset();
            currentPersonnel = null;
            currentPersonnelType = 'driver';
            addLTRTaddDriverModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        // Add mechanic button
        addMechanicBtn.addEventListener('click', function() {
            mechanicForm.reset();
            currentPersonnel = null;
            currentPersonnelType = 'mechanic';
            addMechanicModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        // Export buttons
        exportApplicationsBtn.addEventListener('click', exportApplications);
        exportDriversBtn.addEventListener('click', exportDrivers);
        exportMechanicsBtn.addEventListener('click', exportMechanics);
        
        // Modal close buttons
        cancelDriverBtn.addEventListener('click', closeAddDriverModal);
        cancelMechanicBtn.addEventListener('click', closeAddMechanicModal);
        closePersonnelModalBtn.addEventListener('click', closePersonnelDetailsModal);
        
        // Save buttons
        saveDriverBtn.addEventListener('click', saveDriver);
        saveMechanicBtn.addEventListener('click', saveMechanic);
        savePersonnelChangesBtn.addEventListener('click', savePersonnelChanges);
        
        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === addDriverModal) {
                closeAddDriverModal();
            }
            if (event.target === addMechanicModal) {
                closeAddMechanicModal();
            }
            if (event.target === personnelDetailsModal) {
                closePersonnelDetailsModal();
            }
        });
        
        // Search and filter events
        applicationSearch.addEventListener('input', filterApplications);
        driverSearch.addEventListener('input', filterDrivers);
        mechanicSearch.addEventListener('input', filterMechanics);
        applicationTypeFilter.addEventListener('change', filterApplications);
        applicationDateFilter.addEventListener('change', filterApplications);
        driverStatusFilter.addEventListener('change', filterDrivers);
        driverLicenseFilter.addEventListener('change', filterDrivers);
        mechanicStatusFilter.addEventListener('change', filterMechanics);
        mechanicSpecialtyFilter.addEventListener('change', filterMechanics);
        
        // Delegate events for dynamically created buttons
        document.addEventListener('click', function(event) {
            // View application
            if (event.target.closest('.view-application-btn')) {
                const btn = event.target.closest('.view-application-btn');
                const applicationId = btn.dataset.id;
                viewApplication(applicationId);
            }
            
            // Approve application
            if (event.target.closest('.approve-application-btn')) {
                const btn = event.target.closest('.approve-application-btn');
                const applicationId = btn.dataset.id;
                approveApplication(applicationId);
            }
            
            // Reject application
            if (event.target.closest('.reject-application-btn')) {
                const btn = event.target.closest('.reject-application-btn');
                const applicationId = btn.dataset.id;
                rejectApplication(applicationId);
            }
            
            // View personnel
            if (event.target.closest('.view-personnel-btn')) {
                const btn = event.target.closest('.view-personnel-btn');
                const personnelId = btn.dataset.id;
                const personnelType = btn.dataset.type;
                viewPersonnel(personnelId, personnelType);
            }
            
            // Edit personnel
            if (event.target.closest('.edit-personnel-btn')) {
                const btn = event.target.closest('.edit-personnel-btn');
                const personnelId = btn.dataset.id;
                const personnelType = btn.dataset.type;
                editPersonnel(personnelId, personnelType);
            }
            
            // Delete personnel
            if (event.target.closest('.delete-personnel-btn')) {
                const btn = event.target.closest('.delete-personnel-btn');
                const personnelId = btn.dataset.id;
                const personnelType = btn.dataset.type;
                deletePersonnel(personnelId, personnelType);
            }
        });
    }
    
    // Close add driver modal
    function closeAddDriverModal() {
        addDriverModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Close add mechanic modal
    function closeAddMechanicModal() {
        addMechanicModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Close personnel details modal
    function closePersonnelDetailsModal() {
        personnelDetailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentPersonnel = null;
        currentPersonnelType = null;
    }
    
    // View application details
    function viewApplication(id) {
        const application = applications.find(a => a.id === id);
        if (!application) return;
        
        document.getElementById('personnelModalTitle').textContent = `${application.firstName} ${application.lastName}'s Application`;
        
        let details = '';
        if (application.type === 'driver') {
            details = `
                <div class="detail-row">
                    <div class="detail-label">License Type</div>
                    <div class="detail-value">${application.licenseType}</div>
                </div>
            `;
        } else {
            details = `
                <div class="detail-row">
                    <div class="detail-label">Specialty</div>
                    <div class="detail-value">${application.specialty.charAt(0).toUpperCase() + application.specialty.slice(1)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Experience</div>
                    <div class="detail-value">${application.experience} years</div>
                </div>
            `;
        }
        
        document.getElementById('personnelModalBody').innerHTML = `
            <div class="report-details">
                <div class="detail-row">
                    <div class="detail-label">Application ID</div>
                    <div class="detail-value">${application.id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">
                        <span class="badge ${application.type === 'driver' ? 'badge-primary' : 'badge-warning'}">
                            ${application.type === 'driver' ? 'Driver' : 'Mechanic'}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">${application.firstName} ${application.lastName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">ID Number</div>
                    <div class="detail-value">${application.idNumber}</div>
                </div>
                ${details}
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${application.phone}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${application.email || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Date Applied</div>
                    <div class="detail-value">${formatDate(application.dateApplied)}</div>
                </div>
                <div class="detail-row full-width">
                    <div class="detail-label">Documents</div>
                    <div class="detail-value">
                        <div class="attachments">
                            ${application.documents.map(doc => `
                                <div class="attachment">
                                    <i class="fas fa-file-pdf"></i>
                                    ${doc}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('savePersonnelChangesBtn').style.display = 'none';
        personnelDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Approve application
    function approveApplication(id) {
        if (!confirm('Are you sure you want to approve this application?')) {
            return;
        }
        
        const application = applications.find(a => a.id === id);
        if (!application) return;
        
        if (application.type === 'driver') {
            // Create new driver from application
            const newDriver = {
                id: `DRV-${new Date().getFullYear()}-${String(drivers.length + 1).padStart(3, '0')}`,
                firstName: application.firstName,
                lastName: application.lastName,
                idNumber: application.idNumber,
                licenseType: application.licenseType,
                licenseExpiry: '', // Would be set in a real app
                phone: application.phone,
                email: application.email,
                address: '', // Would be set in a real app
                dateJoined: new Date().toISOString().split('T')[0],
                status: 'active',
                photo: 'default-driver.jpg' // Would be uploaded in a real app
            };
            
            drivers.unshift(newDriver);
            renderDriversTable();
        } else {
            // Create new mechanic from application
            const newMechanic = {
                id: `MEC-${new Date().getFullYear()}-${String(mechanics.length + 1).padStart(3, '0')}`,
                firstName: application.firstName,
                lastName: application.lastName,
                idNumber: application.idNumber,
                specialty: application.specialty,
                experience: application.experience,
                phone: application.phone,
                email: application.email,
                address: '', // Would be set in a real app
                dateJoined: new Date().toISOString().split('T')[0],
                status: 'active',
                photo: 'default-mechanic.jpg' // Would be uploaded in a real app
            };
            
            mechanics.unshift(newMechanic);
            renderMechanicsTable();
        }
        
        // Remove application from list
        applications = applications.filter(a => a.id !== id);
        renderApplications();
        
        alert('Application approved and personnel added to the system');
    }
    
    // Reject application
    function rejectApplication(id) {
        if (!confirm('Are you sure you want to reject this application?')) {
            return;
        }
        
        applications = applications.filter(a => a.id !== id);
        renderApplications();
        alert('Application has been rejected');
    }
    
    // Save driver
    function saveDriver() {
        if (!driverForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newDriver = {
            id: currentPersonnel ? currentPersonnel.id : `DRV-${new Date().getFullYear()}-${String(drivers.length + 1).padStart(3, '0')}`,
            firstName: document.getElementById('driverFirstName').value,
            lastName: document.getElementById('driverLastName').value,
            idNumber: document.getElementById('driverIdNumber').value,
            licenseType: document.getElementById('driverLicenseType').value,
            licenseExpiry: document.getElementById('driverLicenseExpiry').value,
            phone: document.getElementById('driverPhone').value,
            email: document.getElementById('driverEmail').value,
            address: document.getElementById('driverAddress').value,
            dateJoined: document.getElementById('driverDateJoined').value,
            status: document.getElementById('driverStatus').value,
            photo: currentPersonnel ? currentPersonnel.photo : 'driver' + (drivers.length + 1) + '.jpg'
        };
        
        if (currentPersonnel) {
            // Update existing driver
            const index = drivers.findIndex(d => d.id === currentPersonnel.id);
            if (index !== -1) {
                drivers[index] = { ...drivers[index], ...newDriver };
            }
        } else {
            // Add new driver
            drivers.unshift(newDriver);
        }
        
        renderDriversTable();
        closeAddDriverModal();
        alert(`Driver ${newDriver.firstName} ${newDriver.lastName} has been ${currentPersonnel ? 'updated' : 'added'}`);
    }
    
    // Save mechanic
    function saveMechanic() {
        if (!mechanicForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newMechanic = {
            id: currentPersonnel ? currentPersonnel.id : `MEC-${new Date().getFullYear()}-${String(mechanics.length + 1).padStart(3, '0')}`,
            firstName: document.getElementById('mechanicFirstName').value,
            lastName: document.getElementById('mechanicLastName').value,
            idNumber: document.getElementById('mechanicIdNumber').value,
            specialty: document.getElementById('mechanicSpecialty').value,
            experience: parseInt(document.getElementById('mechanicExperience').value),
            phone: document.getElementById('mechanicPhone').value,
            email: document.getElementById('mechanicEmail').value,
            address: document.getElementById('mechanicAddress').value,
            dateJoined: document.getElementById('mechanicDateJoined').value,
            status: document.getElementById('mechanicStatus').value,
            photo: currentPersonnel ? currentPersonnel.photo : 'mechanic' + (mechanics.length + 1) + '.jpg'
        };
        
        if (currentPersonnel) {
            // Update existing mechanic
            const index = mechanics.findIndex(m => m.id === currentPersonnel.id);
            if (index !== -1) {
                mechanics[index] = { ...mechanics[index], ...newMechanic };
            }
        } else {
            // Add new mechanic
            mechanics.unshift(newMechanic);
        }
        
        renderMechanicsTable();
        closeAddMechanicModal();
        alert(`Mechanic ${newMechanic.firstName} ${newMechanic.lastName} has been ${currentPersonnel ? 'updated' : 'added'}`);
    }
    
    // View personnel details
    function viewPersonnel(id, type) {
        currentPersonnelType = type;
        
        if (type === 'driver') {
            currentPersonnel = drivers.find(d => d.id === id);
        } else {
            currentPersonnel = mechanics.find(m => m.id === id);
        }
        
        if (!currentPersonnel) return;
        
        document.getElementById('personnelModalTitle').textContent = `${currentPersonnel.firstName} ${currentPersonnel.lastName} Details`;
        
        let detailsHtml = `
            <div class="personnel-info" style="margin-bottom: 20px;">
                <img src="${currentPersonnel.photo}" alt="${currentPersonnel.firstName} ${currentPersonnel.lastName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                <div style="margin-left: 15px;">
                    <h3 style="margin-bottom: 5px;">${currentPersonnel.firstName} ${currentPersonnel.lastName}</h3>
                    <div style="color: var(--dark-gray); margin-bottom: 5px;">ID: ${currentPersonnel.id}</div>
                    <div style="display: flex; gap: 10px;">
                        <span class="badge ${type === 'driver' ? 'badge-primary' : 'badge-warning'}">
                            ${type === 'driver' ? 'Driver' : 'Mechanic'}
                        </span>
                        <span class="badge ${currentPersonnel.status === 'active' ? 'badge-success' : currentPersonnel.status === 'inactive' ? 'badge-danger' : 'badge-warning'}">
                            ${currentPersonnel.status.charAt(0).toUpperCase() + currentPersonnel.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <div class="detail-label">ID Number</div>
                    <div class="detail-value">${currentPersonnel.idNumber}</div>
                </div>
            `;
        
        if (type === 'driver') {
            detailsHtml += `
                <div>
                    <div class="detail-label">License Type</div>
                    <div class="detail-value">${currentPersonnel.licenseType}</div>
                </div>
                <div>
                    <div class="detail-label">License Expiry</div>
                    <div class="detail-value">${formatDate(currentPersonnel.licenseExpiry)}</div>
                </div>
            `;
        } else {
            detailsHtml += `
                <div>
                    <div class="detail-label">Specialty</div>
                    <div class="detail-value">${currentPersonnel.specialty.charAt(0).toUpperCase() + currentPersonnel.specialty.slice(1)}</div>
                </div>
                <div>
                    <div class="detail-label">Experience</div>
                    <div class="detail-value">${currentPersonnel.experience} years</div>
                </div>
            `;
        }
        
        detailsHtml += `
                <div>
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${currentPersonnel.phone}</div>
                </div>
                <div>
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${currentPersonnel.email || 'N/A'}</div>
                </div>
                <div>
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${currentPersonnel.address || 'N/A'}</div>
                </div>
                <div>
                    <div class="detail-label">Date Joined</div>
                    <div class="detail-value">${formatDate(currentPersonnel.dateJoined)}</div>
                </div>
            </div>
        `;
        
        document.getElementById('personnelModalBody').innerHTML = detailsHtml;
        document.getElementById('savePersonnelChangesBtn').style.display = 'none';
        personnelDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Edit personnel
    function editPersonnel(id, type) {
        currentPersonnelType = type;
        
        if (type === 'driver') {
            currentPersonnel = drivers.find(d => d.id === id);
            if (currentPersonnel) {
                // Populate the driver form
                document.getElementById('driverFirstName').value = currentPersonnel.firstName;
                document.getElementById('driverLastName').value = currentPersonnel.lastName;
                document.getElementById('driverIdNumber').value = currentPersonnel.idNumber;
                document.getElementById('driverLicenseType').value = currentPersonnel.licenseType;
                document.getElementById('driverLicenseExpiry').value = currentPersonnel.licenseExpiry;
                document.getElementById('driverPhone').value = currentPersonnel.phone;
                document.getElementById('driverEmail').value = currentPersonnel.email || '';
                document.getElementById('driverAddress').value = currentPersonnel.address || '';
                document.getElementById('driverDateJoined').value = currentPersonnel.dateJoined;
                document.getElementById('driverStatus').value = currentPersonnel.status;
                
                addDriverModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        } else {
            currentPersonnel = mechanics.find(m => m.id === id);
            if (currentPersonnel) {
                // Populate the mechanic form
                document.getElementById('mechanicFirstName').value = currentPersonnel.firstName;
                document.getElementById('mechanicLastName').value = currentPersonnel.lastName;
                document.getElementById('mechanicIdNumber').value = currentPersonnel.idNumber;
                document.getElementById('mechanicSpecialty').value = currentPersonnel.specialty;
                document.getElementById('mechanicExperience').value = currentPersonnel.experience;
                document.getElementById('mechanicPhone').value = currentPersonnel.phone;
                document.getElementById('mechanicEmail').value = currentPersonnel.email || '';
                document.getElementById('mechanicAddress').value = currentPersonnel.address || '';
                document.getElementById('mechanicDateJoined').value = currentPersonnel.dateJoined;
                document.getElementById('mechanicStatus').value = currentPersonnel.status;
                
                addMechanicModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }
    }
    
    // Save personnel changes (from view/edit modal)
    function savePersonnelChanges() {
        if (!currentPersonnel || !currentPersonnelType) return;
        
        if (currentPersonnelType === 'driver') {
            saveDriver();
        } else {
            saveMechanic();
        }
    }
    
    // Delete personnel
    function deletePersonnel(id, type) {
        if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
            return;
        }
        
        if (type === 'driver') {
            drivers = drivers.filter(d => d.id !== id);
            renderDriversTable();
        } else {
            mechanics = mechanics.filter(m => m.id !== id);
            renderMechanicsTable();
        }
        
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    }
    
    // Export applications
    function exportApplications() {
        const filteredApplications = filterApplicationData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredApplications, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `applications_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    // Export drivers
    function exportDrivers() {
        const filteredDrivers = filterDriverData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredDrivers, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `drivers_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    // Export mechanics
    function exportMechanics() {
        const filteredMechanics = filterMechanicData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredMechanics, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mechanics_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    // Filter applications
    function filterApplications() {
        const filteredApplications = filterApplicationData();
        renderFilteredApplications(filteredApplications);
    }
    
    // Filter drivers
    function filterDrivers() {
        const filteredDrivers = filterDriverData();
        renderFilteredDrivers(filteredDrivers);
    }
    
    // Filter mechanics
    function filterMechanics() {
        const filteredMechanics = filterMechanicData();
        renderFilteredMechanics(filteredMechanics);
    }
    
    // Get filtered application data
    function filterApplicationData() {
        const searchTerm = applicationSearch.value.toLowerCase();
        const typeFilter = applicationTypeFilter.value;
        const dateFilter = applicationDateFilter.value;
        
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return applications.filter(application => {
            // Search filter
            const matchesSearch = 
                application.firstName.toLowerCase().includes(searchTerm) ||
                application.lastName.toLowerCase().includes(searchTerm) ||
                application.idNumber.toLowerCase().includes(searchTerm) ||
                application.phone.toLowerCase().includes(searchTerm) ||
                application.id.toLowerCase().includes(searchTerm);
            
            // Type filter
            const matchesType = typeFilter === 'all' || application.type === typeFilter;
            
            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const appDate = new Date(application.dateApplied);
                
                if (dateFilter === 'today' && !isSameDay(appDate, new Date())) {
                    matchesDate = false;
                } else if (dateFilter === 'week' && appDate < startOfWeek) {
                    matchesDate = false;
                } else if (dateFilter === 'month' && appDate < startOfMonth) {
                    matchesDate = false;
                }
            }
            
            return matchesSearch && matchesType && matchesDate;
        });
    }
    
    // Get filtered driver data
    function filterDriverData() {
        const searchTerm = driverSearch.value.toLowerCase();
        const statusFilter = driverStatusFilter.value;
        const licenseFilter = driverLicenseFilter.value;
        
        return drivers.filter(driver => {
            // Search filter
            const matchesSearch = 
                driver.firstName.toLowerCase().includes(searchTerm) ||
                driver.lastName.toLowerCase().includes(searchTerm) ||
                driver.idNumber.toLowerCase().includes(searchTerm) ||
                driver.phone.toLowerCase().includes(searchTerm) ||
                driver.id.toLowerCase().includes(searchTerm);
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
            
            // License filter
            const matchesLicense = licenseFilter === 'all' || driver.licenseType.toLowerCase() === licenseFilter;
            
            return matchesSearch && matchesStatus && matchesLicense;
        });
    }
    
    // Get filtered mechanic data
    function filterMechanicData() {
        const searchTerm = mechanicSearch.value.toLowerCase();
        const statusFilter = mechanicStatusFilter.value;
        const specialtyFilter = mechanicSpecialtyFilter.value;
        
        return mechanics.filter(mechanic => {
            // Search filter
            const matchesSearch = 
                mechanic.firstName.toLowerCase().includes(searchTerm) ||
                mechanic.lastName.toLowerCase().includes(searchTerm) ||
                mechanic.idNumber.toLowerCase().includes(searchTerm) ||
                mechanic.phone.toLowerCase().includes(searchTerm) ||
                mechanic.id.toLowerCase().includes(searchTerm);
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || mechanic.status === statusFilter;
            
            // Specialty filter
            const matchesSpecialty = specialtyFilter === 'all' || mechanic.specialty.toLowerCase() === specialtyFilter;
            
            return matchesSearch && matchesStatus && matchesSpecialty;
        });
    }
    
    // Render filtered applications
    function renderFilteredApplications(filteredApplications) {
        applicationsList.innerHTML = '';
        
        filteredApplications.forEach(application => {
            const card = document.createElement('div');
            card.className = 'application-card';
            card.dataset.id = application.id;
            
            let details = '';
            if (application.type === 'driver') {
                details = `
                    <p><strong>License Type:</strong> ${application.licenseType}</p>
                `;
            } else {
                details = `
                    <p><strong>Specialty:</strong> ${application.specialty.charAt(0).toUpperCase() + application.specialty.slice(1)}</p>
                    <p><strong>Experience:</strong> ${application.experience} years</p>
                `;
            }
            
            card.innerHTML = `
                <div class="application-header">
                    <h4>${application.firstName} ${application.lastName}</h4>
                    <span class="badge ${application.type === 'driver' ? 'badge-primary' : 'badge-warning'}">
                        ${application.type === 'driver' ? 'Driver Application' : 'Mechanic Application'}
                    </span>
                </div>
                <div class="application-meta">
                    <span><i class="fas fa-id-card"></i> ${application.idNumber}</span>
                    <span><i class="fas fa-phone"></i> ${application.phone}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(application.dateApplied)}</span>
                </div>
                ${details}
                <div class="application-meta">
                    <span><i class="fas fa-paperclip"></i> Documents: ${application.documents.join(', ')}</span>
                </div>
                <div class="application-actions">
                    <button class="btn btn-outline btn-sm view-application-btn" data-id="${application.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-success btn-sm approve-application-btn" data-id="${application.id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm reject-application-btn" data-id="${application.id}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
            
            applicationsList.appendChild(card);
        });
    }
    
    // Render filtered drivers
    function renderFilteredDrivers(filteredDrivers) {
        driversTableBody.innerHTML = '';
        
        filteredDrivers.forEach(driver => {
            const row = document.createElement('tr');
            row.dataset.id = driver.id;
            
            let statusClass = '';
            let statusText = '';
            switch(driver.status) {
                case 'active':
                    statusClass = 'badge-success';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusClass = 'badge-danger';
                    statusText = 'Inactive';
                    break;
                case 'on-leave':
                    statusClass = 'badge-warning';
                    statusText = 'On Leave';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="personnel-info">
                        <img src="${driver.photo}" alt="${driver.firstName} ${driver.lastName}" class="personnel-avatar">
                        <div>
                            <div class="personnel-name">${driver.firstName} ${driver.lastName}</div>
                            <div class="personnel-id">${driver.id}</div>
                        </div>
                    </div>
                </td>
                <td>${driver.idNumber}</td>
                <td><span class="badge badge-primary">${driver.licenseType}</span></td>
                <td>${driver.phone}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(driver.dateJoined)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm view-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm edit-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm delete-personnel-btn" data-type="driver" data-id="${driver.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            driversTableBody.appendChild(row);
        });
    }
    
    // Render filtered mechanics
    function renderFilteredMechanics(filteredMechanics) {
        mechanicsTableBody.innerHTML = '';
        
        filteredMechanics.forEach(mechanic => {
            const row = document.createElement('tr');
            row.dataset.id = mechanic.id;
            
            let statusClass = '';
            let statusText = '';
            switch(mechanic.status) {
                case 'active':
                    statusClass = 'badge-success';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusClass = 'badge-danger';
                    statusText = 'Inactive';
                    break;
                case 'on-leave':
                    statusClass = 'badge-warning';
                    statusText = 'On Leave';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="personnel-info">
                        <img src="${mechanic.photo}" alt="${mechanic.firstName} ${mechanic.lastName}" class="personnel-avatar">
                        <div>
                            <div class="personnel-name">${mechanic.firstName} ${mechanic.lastName}</div>
                            <div class="personnel-id">${mechanic.id}</div>
                        </div>
                    </div>
                </td>
                <td>${mechanic.idNumber}</td>
                <td><span class="badge badge-primary">${mechanic.specialty.charAt(0).toUpperCase() + mechanic.specialty.slice(1)}</span></td>
                <td>${mechanic.phone}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(mechanic.dateJoined)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm view-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm edit-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm delete-personnel-btn" data-type="mechanic" data-id="${mechanic.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            mechanicsTableBody.appendChild(row);
        });
    }
    
    // Helper function to check if two dates are the same day
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    // Initialize the page
    init();
});