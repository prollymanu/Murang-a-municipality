document.addEventListener('DOMContentLoaded', function() {
    // --- Sidebar Toggle ---
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
      });
    }
  
    // ---modal open buttons---
    const addMechanicBtn = document.getElementById('add-mechanic-btn');
    const addMechanicModal = document.getElementById('add-mechanic-modal');
    const mechanicForm = document.getElementById('mechanic-form');
  
    if (addMechanicBtn && addMechanicModal) {
      addMechanicBtn.addEventListener('click', () => {
        addMechanicModal.classList.add('active');
        document.body.classList.add('modal-open');
      });
    }
      const addDriverBtn = document.getElementById('add-driver-btn');
    const addDriverModal = document.getElementById('add-driver-modal');
    if (addDriverBtn && addDriverModal) {
      addDriverBtn.addEventListener('click', () => {
        addDriverModal.classList.add('active');
        document.body.classList.add('modal-open');
      });
    }
  
    if (mechanicForm) {
      mechanicForm.addEventListener('submit', e => {
        e.preventDefault();
        alert("Mechanic added successfully!");
        addMechanicModal.classList.remove('active');
        document.body.style.overflow = '';
        mechanicForm.reset();
        location.reload();
      });
    }
  
      // --- Modal Close (X and Cancel)
  
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('active');
          document.body.classList.remove('modal-open');
        }
      });
    });
  
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.classList.remove('modal-open');
        }
      });
    });
  
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
          document.body.classList.remove('modal-open');
        });
      }
    });
  
    const modal = document.getElementById('reportModal');
    const closeBtn = document.querySelector('.close-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
  
    const reportsData = {
      "REP-2023-001": {
        vehicle: "KBT 123K (Toyota Land Cruiser)",
        mechanic: "James Mwangi",
        issue: "Engine Overhaul",
        cost: "42,000 KES",
        date: "15 Oct 2023",
        status: "Approved",
        description: "Complete engine overhaul including piston replacement, cylinder head repair, and turbocharger maintenance. Vehicle had severe overheating issues and loss of power.",
        attachments: ["diagnostic_report.pdf", "engine_photo.jpg"]
      },
      "REP-2023-002": {
        vehicle: "KBT 456L (Isuzu NPR)",
        mechanic: "Peter Kariuki",
        issue: "Brake System Repair",
        cost: "28,500 KES",
        date: "14 Oct 2023",
        status: "Approved",
        description: "Replaced all brake pads, rotors, and brake fluid flush. Also fixed a leak in the brake line. Vehicle had reduced braking efficiency.",
        attachments: ["brake_report.pdf", "brake_pads.jpg"]
      },
      "REP-2023-003": {
        vehicle: "KBT 789M (Mitsubishi L200)",
        mechanic: "David Kamau",
        issue: "Suspension Repair",
        cost: "35,000 KES",
        date: "10 Oct 2023",
        status: "Pending",
        description: "Replaced front shock absorbers and stabilizer links. Vehicle was experiencing excessive bouncing and noise when driving over bumps.",
        attachments: ["suspension_report.pdf", "shocks_photo.jpg"]
      },
      "REP-2023-004": {
        vehicle: "KBT 101N (Ford Ranger)",
        mechanic: "Samuel Otieno",
        issue: "Electrical System Fault",
        cost: "18,750 KES",
        date: "08 Oct 2023",
        status: "Rejected",
        description: "Diagnosed and repaired multiple electrical issues including faulty alternator, battery replacement, and wiring harness repair. Vehicle was not starting consistently.",
        attachments: ["electrical_report.pdf", "wiring_diagram.jpg"]
      },
      "REP-2023-005": {
        vehicle: "KBT 202P (Nissan Navara)",
        mechanic: "John Kimani",
        issue: "Transmission Repair",
        cost: "65,300 KES",
        date: "05 Oct 2023",
        status: "Approved",
        description: "Complete transmission rebuild including replacement of clutch assembly and gear synchronizers. Vehicle was having difficulty shifting gears.",
        attachments: ["transmission_report.pdf", "clutch_assembly.jpg"]
      }
    };
  
    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        const reportId = this.getAttribute('data-id');
        const report = reportsData[reportId];
  
        if (report) {
          document.getElementById('modalReportId').textContent = reportId;
          document.getElementById('modalVehicle').textContent = report.vehicle;
          document.getElementById('modalMechanic').textContent = report.mechanic;
          document.getElementById('modalIssue').textContent = report.issue;
          document.getElementById('modalCost').textContent = report.cost;
          document.getElementById('modalDate').textContent = report.date;
          document.getElementById('modalDescription').textContent = report.description;
  
          const statusElement = document.getElementById('modalStatus');
          statusElement.innerHTML = '';
          const badge = document.createElement('span');
          badge.className = 'badge ' +
            (report.status === 'Approved' ? 'badge-success' :
              report.status === 'Pending' ? 'badge-warning' : 'badge-danger');
          badge.textContent = report.status;
          statusElement.appendChild(badge);
  
          modal.classList.add('active');
        }
      });
    });
  
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
  
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modal = document.getElementById(trigger.getAttribute('data-modal-target'));
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (user && pass) window.location.href = 'dashboard.html';
        else alert('Please enter both username and password');
      });
    }
  
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
      invoiceForm.addEventListener('submit', e => {
        e.preventDefault();
        const alertBox = document.createElement('div');
        alertBox.className = 'alert alert-success';
        alertBox.innerHTML = '<i class="fas fa-check-circle"></i> Invoice submitted successfully!';
        invoiceForm.parentNode.insertBefore(alertBox, invoiceForm);
        invoiceForm.reset();
        setTimeout(() => alertBox.remove(), 5000);
      });
    }
  
    ['driver', 'mechanic'].forEach(type => {
      const form = document.getElementById(`${type}-form`);
      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          alert(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
          document.getElementById(`add-${type}-modal`).classList.remove('active');
          form.reset();
          if (window.location.pathname.includes(`registered-${type}s.html`))
            window.location.reload();
        });
      }
    });
  
    document.querySelectorAll('.btn-approve, .btn-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const id = row.querySelector('td:first-child').innerText;
        const action = btn.classList.contains('btn-approve') ? 'approved' : 'rejected';
        alert(`Report ${id} ${action}!`);
        row.remove();
      });
    });
  
    document.querySelectorAll('.btn-approve-request, .btn-reject-request').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const id = row.querySelector('td:first-child').innerText;
        const action = btn.classList.contains('btn-approve-request') ? 'approved' : 'rejected';
        alert(`Driver request ${id} ${action}!`);
        row.remove();
      });
    });
  
    document.querySelectorAll('.rating-star').forEach(star => {
      star.addEventListener('click', () => {
        const r = star.getAttribute('data-rating');
        star.closest('.mechanic-card').querySelectorAll('.rating-star').forEach(s => {
          s.classList.toggle('fas', s.getAttribute('data-rating') <= r);
          s.classList.toggle('far', s.getAttribute('data-rating') > r);
        });
        alert('Thank you for rating!');
      });
    });
  
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', () => {
        const label = input.nextElementSibling;
        if (input.files.length > 0)
          label.querySelector('span').innerText = `${input.files.length} file(s) selected`;
        else
          label.querySelector('span').innerText = 'Choose files or drag them here';
      });
    });
  
    document.querySelectorAll('.btn-export').forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Preparing data for export...');
      });
    });
  
    function handleResize() {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      if (window.innerWidth < 992) {
        sidebar.classList.remove('active');
        mainContent.classList.remove('sidebar-collapsed');
      } else {
        sidebar.classList.add('active');
      }
    }
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const tip = document.createElement('div');
        tip.className = 'tooltip';
        tip.innerText = el.getAttribute('data-tooltip');
        document.body.appendChild(tip);
        const rect = el.getBoundingClientRect();
        tip.style.top = `${rect.top - tip.offsetHeight - 5}px`;
        tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2}px`;
        el.addEventListener('mouseleave', () => tip.remove(), { once: true });
      });
    });
  });
  