function applyFilters() {
    const status = document.getElementById('status-filter').value;
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    let url = '?';
    if (status) url += `status=${status}&`;
    if (start) url += `start_date=${start}&`;
    if (end) url += `end_date=${end}&`;
    window.location.href = url;
  }
  
  function searchInvoices() {
    //  search functionality 
    const searchTerm = document.getElementById('invoice-search').value.toLowerCase();
    const rows = document.querySelectorAll('.invoice-table tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  }
  
  