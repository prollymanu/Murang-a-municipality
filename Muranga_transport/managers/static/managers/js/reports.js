// Sample report data
const reports = [
    {
        id: 'rep-2023-045',
        driver: {
            name: 'John Kamau',
            id: 'DRV-2022-015',
            avatar: 'driver1.jpg'
        },
        vehicle: 'Toyota Land Cruiser',
        license: 'KAB 123X',
        type: 'Mechanical',
        description: 'While driving back from the county offices, I noticed the brake pedal was feeling soft and the vehicle was taking longer to stop than usual. There was also a squeaking noise coming from the front wheels when braking. The issue seems to be getting worse, and I\'m concerned about the safety of the vehicle. I recommend immediate inspection of the brake system before the vehicle is used again.',
        status: 'urgent',
        urgency: 'High (Immediate attention required)',
        date: 'June 15, 2023 at 10:45 AM',
        attachments: ['brake1.jpg', 'brake2.jpg'],
        responses: [
            {
                sender: 'Transport Manager',
                date: 'Jun 15, 2023 11:30 AM',
                message: 'I\'ve forwarded this to our mechanics for immediate inspection. The vehicle should not be used until brakes are checked.'
            },
            {
                sender: 'Mechanic Team',
                date: 'Jun 15, 2023 2:15 PM',
                message: 'Brake pads worn out and fluid leaking. Parts ordered, will be repaired by tomorrow.'
            }
        ]
    },
    {
        id: 'rep-2023-044',
        driver: {
            name: 'Mary Wambui',
            id: 'DRV-2021-032',
            avatar: 'driver2.jpg'
        },
        vehicle: 'Mitsubishi Canter',
        license: 'KCD 789M',
        type: 'Electrical',
        description: 'Several dashboard warning lights came on during today\'s trip including the battery light and check engine light. The lights flicker occasionally but remain mostly on. Vehicle performance seems unaffected but this needs to be checked.',
        status: 'in-progress',
        urgency: 'Medium (Needs attention soon)',
        date: 'June 14, 2023 at 2:30 PM',
        attachments: ['dashboard1.jpg'],
        responses: [
            {
                sender: 'Transport Manager',
                date: 'Jun 14, 2023 3:45 PM',
                message: 'Please bring the vehicle in for diagnostics tomorrow morning.'
            }
        ]
    },
    {
        id: 'rep-2023-043',
        driver: {
            name: 'James Odhiambo',
            id: 'DRV-2020-008',
            avatar: 'driver3.jpg'
        },
        vehicle: 'Toyota Hilux',
        license: 'KAB 456B',
        type: 'Body',
        description: 'Discovered a dent on the rear bumper after parking at the county offices. Not sure when it happened as I didn\'t notice any impact. The dent is about 15cm wide and has scratched the paint.',
        status: 'pending',
        urgency: 'Low (Can wait)',
        date: 'June 12, 2023 at 4:15 PM',
        attachments: ['dent1.jpg', 'dent2.jpg'],
        responses: []
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const viewReportBtns = document.querySelectorAll('.view-report-btn');
    const editReportBtns = document.querySelectorAll('.edit-report-btn');
    const reportModal = document.getElementById('reportDetailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalCloseBtn = document.querySelector('.close-btn');
    const saveResponseBtn = document.getElementById('saveResponseBtn');
    const responseTextarea = document.getElementById('response-textarea');
    const responsesContainer = document.getElementById('responses-container');
    const exportBtn = document.getElementById('exportBtn');
    const createReportBtn = document.getElementById('createReportBtn');
    const createReportModal = document.getElementById('createReportModal');
    const cancelCreateReportBtn = document.getElementById('cancelCreateReportBtn');
    const submitReportBtn = document.getElementById('submitReportBtn');
    const createReportForm = document.getElementById('createReportForm');
    
    // Filter elements
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    const vehicleFilter = document.getElementById('vehicle-filter');
    const dateFilter = document.getElementById('date-filter');
    const driverFilter = document.getElementById('driver-filter');
    
    // Current report being viewed
    let currentReport = null;

    // Initialize event listeners
    function initEventListeners() {
        // View report buttons
        viewReportBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reportId = this.closest('tr').getAttribute('data-id');
                const report = reports.find(r => r.id === reportId);
                
                if (report) {
                    currentReport = report;
                    openReportModal(report);
                }
            });
        });

        // Edit report buttons
        editReportBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reportId = this.closest('tr').getAttribute('data-id');
                const report = reports.find(r => r.id === reportId);
                
                if (report) {
                    currentReport = report;
                    openEditReportModal(report);
                }
            });
        });

        // Close modal buttons
        closeModalBtn.addEventListener('click', closeReportModal);
        modalCloseBtn.addEventListener('click', closeReportModal);
        
        // Close when clicking outside modal
        window.addEventListener('click', function(event) {
            if (event.target === reportModal) {
                closeReportModal();
            }
            if (event.target === createReportModal) {
                closeCreateReportModal();
            }
        });

        // Save response button
        saveResponseBtn.addEventListener('click', saveResponse);

        // Export button
        exportBtn.addEventListener('click', exportReports);

        // Create report button
        createReportBtn.addEventListener('click', openCreateReportModal);

        // Create report modal buttons
        cancelCreateReportBtn.addEventListener('click', closeCreateReportModal);
        submitReportBtn.addEventListener('click', submitNewReport);

        // Filter reports when filter values change
        [statusFilter, typeFilter, vehicleFilter, dateFilter, driverFilter].forEach(filter => {
            filter.addEventListener('change', filterReports);
        });
    }

    // Function to open modal and populate with report data
    function openReportModal(report) {
        document.getElementById('modal-report-id').textContent = report.id;
        
        const driverInfo = document.getElementById('modal-driver');
        driverInfo.innerHTML = `
            <div class="report-driver">
                <img src="${report.driver.avatar}" alt="Driver" class="driver-avatar">
                <div class="driver-info">
                    <span class="driver-name">${report.driver.name}</span>
                    <span class="driver-id">${report.driver.id}</span>
                </div>
            </div>
        `;
        
        document.getElementById('modal-vehicle').textContent = report.vehicle;
        document.getElementById('modal-license').textContent = report.license;
        document.getElementById('modal-type').textContent = report.type;
        document.getElementById('modal-urgency').textContent = report.urgency;
        document.getElementById('modal-date').textContent = report.date;
        document.getElementById('modal-description').textContent = report.description;
        
        // Set the status dropdown
        const statusSelect = document.getElementById('modal-status');
        statusSelect.value = report.status;
        
        // Update attachments
        const attachmentsContainer = document.getElementById('modal-attachments');
        attachmentsContainer.innerHTML = '';
        report.attachments.forEach(attachment => {
            attachmentsContainer.innerHTML += `<img src="${attachment}" alt="Attachment" class="attachment-thumbnail">`;
        });
        
        // Update responses
        responsesContainer.innerHTML = '';
        if (report.responses && report.responses.length > 0) {
            report.responses.forEach(response => {
                addResponseToUI(response);
            });
        } else {
            responsesContainer.innerHTML = '<p>No responses yet</p>';
        }
        
        // Clear the response textarea
        responseTextarea.value = '';
        
        // Show modal
        reportModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Function to open edit report modal
    function openEditReportModal(report) {
        alert(`Edit functionality for report ${report.id} would open an edit form in a real application.`);
        // In a real application, this would open a modal similar to the create report modal
        // but pre-populated with the report data for editing
    }

    // Add a response to the UI
    function addResponseToUI(response) {
        const responseElement = document.createElement('div');
        responseElement.className = 'response-item';
        responseElement.innerHTML = `
            <div class="response-meta">
                <span>${response.sender}</span>
                <span>${response.date}</span>
            </div>
            <p>${response.message}</p>
        `;
        responsesContainer.prepend(responseElement);
    }

    // Close the report modal
    function closeReportModal() {
        reportModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentReport = null;
    }
    
    // Open create report modal
    function openCreateReportModal() {
        createReportModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Close create report modal
    function closeCreateReportModal() {
        createReportModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        createReportForm.reset();
    }

    // Save a new response
    function saveResponse() {
        if (!currentReport) return;
        
        const newStatus = document.getElementById('modal-status').value;
        const responseText = responseTextarea.value.trim();
        
        if (responseText === '') {
            alert('Please enter a response before sending');
            return;
        }
        
        // Update the status in the table
        const reportRow = document.querySelector(`tr[data-id="${currentReport.id}"]`);
        if (reportRow) {
            const statusCell = reportRow.querySelector('.report-status');
            statusCell.className = 'report-status';
            statusCell.classList.add(`status-${newStatus.replace('-', '')}`);
            
            let statusText = '';
            switch(newStatus) {
                case 'pending':
                    statusText = 'Pending';
                    break;
                case 'in-progress':
                    statusText = 'In Progress';
                    break;
                case 'resolved':
                    statusText = 'Resolved';
                    break;
                case 'urgent':
                    statusText = 'Urgent';
                    break;
            }
            
            statusCell.textContent = statusText;
            reportRow.setAttribute('data-status', newStatus);
        }
        
        // Create new response
        const newResponse = {
            sender: 'Transport Manager',
            date: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }),
            message: responseText
        };
        
        // In a real app, you would send this data to the server
        console.log('New response:', newResponse);
        
        // Add response to the current report
        if (!currentReport.responses) {
            currentReport.responses = [];
        }
        currentReport.responses.push(newResponse);
        
        // Add response to the UI
        addResponseToUI(newResponse);
        
        // Clear the textarea
        responseTextarea.value = '';
        
        // Show success message
        alert(`Response sent for report ${currentReport.id}`);
    }
    
    // Export reports
    function exportReports() {
        // Get current filter values
        const status = statusFilter.value;
        const type = typeFilter.value;
        const vehicle = vehicleFilter.value;
        const dateRange = dateFilter.value;
        const driver = driverFilter.value;
        
        // In a real application, this would generate a CSV or PDF file
        // with the filtered reports data
        alert(`Exporting reports with filters:\nStatus: ${status}\nType: ${type}\nVehicle: ${vehicle}\nDate Range: ${dateRange}\nDriver: ${driver}`);
        
        // For demo purposes, we'll just simulate a download
        const exportData = {
            filters: {
                status,
                type,
                vehicle,
                dateRange,
                driver
            },
            reports: reports.filter(report => {
                // Apply the same filters as the table
                let include = true;
                
                if (status !== 'all' && report.status !== status) {
                    include = false;
                }
                
                if (type !== 'all' && report.type.toLowerCase() !== type) {
                    include = false;
                }
                
                if (vehicle !== 'all' && report.license.toLowerCase() !== vehicle) {
                    include = false;
                }
                
                if (driver !== 'all') {
                    const driverId = report.driver.name.toLowerCase().split(' ')[1];
                    if (driverId !== driver) {
                        include = false;
                    }
                }
                
                return include;
            })
        };
        
        console.log('Export data:', exportData);
        
        // Simulate download
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `reports_export_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
    
    // Submit new report
    function submitNewReport() {
        const type = document.getElementById('new-report-type').value;
        const vehicle = document.getElementById('new-report-vehicle').value;
        const urgency = document.getElementById('new-report-urgency').value;
        const description = document.getElementById('new-report-description').value;
        const attachments = document.getElementById('new-report-attachments').files;
        
        // Validate form
        if (!type || !vehicle || !description) {
            alert('Please fill in all required fields');
            return;
        }
        
        // In a real application, this would send the data to the server
        // and handle the file uploads properly
        const newReport = {
            id: `REP-2023-${Math.floor(Math.random() * 1000)}`,
            driver: {
                name: 'Transport Manager',
                id: 'MGR-001',
                avatar: 'murangalogo.png'
            },
            vehicle: vehicle.split(' - ')[1],
            license: vehicle.split(' - ')[0],
            type: type.charAt(0).toUpperCase() + type.slice(1),
            description: description,
            status: 'pending',
            urgency: urgency === 'high' ? 'High (Immediate attention required)' : 
                    urgency === 'medium' ? 'Medium (Needs attention soon)' : 'Low (Can wait)',
            date: new Date().toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }),
            attachments: [],
            responses: []
        };
        
        // Simulate file upload (in real app, this would be handled by the server)
        if (attachments.length > 0) {
            for (let i = 0; i < Math.min(attachments.length, 3); i++) {
                newReport.attachments.push(`attachment_${i+1}.jpg`);
            }
        }
        
        console.log('New report submitted:', newReport);
        
        // Add to reports array (in real app, this would come from server response)
        reports.unshift(newReport);
        
        // Add to table
        addReportToTable(newReport);
        
        // Close modal and reset form
        closeCreateReportModal();
        
        // Show success message
        alert(`Report ${newReport.id} created successfully!`);
    }
    
    // Add new report to table
    function addReportToTable(report) {
        const tableBody = document.querySelector('.reports-table tbody');
        const statusClass = `status-${report.status}`;
        const statusText = report.status.charAt(0).toUpperCase() + report.status.slice(1);
        
        const driverId = report.driver.name.toLowerCase().split(' ')[1];
        const vehicleId = report.license.toLowerCase();
        
        const newRow = document.createElement('tr');
        newRow.className = 'report-row';
        newRow.setAttribute('data-id', report.id);
        newRow.setAttribute('data-status', report.status);
        newRow.setAttribute('data-type', report.type.toLowerCase());
        newRow.setAttribute('data-vehicle', vehicleId);
        newRow.setAttribute('data-driver', driverId);
        newRow.setAttribute('data-date', new Date().toISOString().split('T')[0]);
        
        newRow.innerHTML = `
            <td>${report.id}</td>
            <td>
                <div class="report-driver">
                    <img src="${report.driver.avatar}" alt="Driver" class="driver-avatar">
                    <div class="driver-info">
                        <span class="driver-name">${report.driver.name}</span>
                        <span class="driver-id">${report.driver.id}</span>
                    </div>
                </div>
            </td>
            <td>${report.license}</td>
            <td>${report.type}</td>
            <td>${report.description.substring(0, 50)}${report.description.length > 50 ? '...' : ''}</td>
            <td><span class="report-status ${statusClass}">${statusText}</span></td>
            <td>${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td>
                <div class="report-actions">
                    <button class="btn btn-outline btn-sm view-report-btn"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-outline btn-sm edit-report-btn"><i class="fas fa-edit"></i> Edit</button>
                </div>
            </td>
        `;
        
        // Add event listeners to new buttons
        newRow.querySelector('.view-report-btn').addEventListener('click', function() {
            currentReport = report;
            openReportModal(report);
        });
        
        newRow.querySelector('.edit-report-btn').addEventListener('click', function() {
            currentReport = report;
            openEditReportModal(report);
        });
        
        // Insert at the top of the table
        tableBody.insertBefore(newRow, tableBody.firstChild);
    }

    // Filter reports based on selected filters
    function filterReports() {
        const status = statusFilter.value;
        const type = typeFilter.value;
        const vehicle = vehicleFilter.value;
        const dateRange = dateFilter.value;
        const driver = driverFilter.value;
        
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.querySelectorAll('.report-row').forEach(row => {
            const rowStatus = row.getAttribute('data-status');
            const rowType = row.getAttribute('data-type');
            const rowVehicle = row.getAttribute('data-vehicle');
            const rowDriver = row.getAttribute('data-driver');
            const rowDate = new Date(row.getAttribute('data-date'));
            
            let showRow = true;
            
            // Status filter
            if (status !== 'all' && rowStatus !== status) {
                showRow = false;
            }
            
            // Type filter
            if (type !== 'all' && rowType !== type) {
                showRow = false;
            }
            
            // Vehicle filter
            if (vehicle !== 'all' && rowVehicle !== vehicle) {
                showRow = false;
            }
            
            // Driver filter
            if (driver !== 'all' && rowDriver !== driver) {
                showRow = false;
            }
            
            // Date filter
            if (dateRange !== 'all') {
                if (dateRange === 'today' && !isSameDay(rowDate, new Date())) {
                    showRow = false;
                } else if (dateRange === 'week' && rowDate < startOfWeek) {
                    showRow = false;
                } else if (dateRange === 'month' && rowDate < startOfMonth) {
                    showRow = false;
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    // Helper function to check if two dates are the same day
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarNav = document.querySelector('.sidebar-nav');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebarNav.classList.toggle('active');
        });
    }

    // Initialize all event listeners
    initEventListeners();
});