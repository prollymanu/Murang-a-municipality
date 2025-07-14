// Minimal toggle for export options
document.getElementById('exportBtn').addEventListener('click', function() {
    const exportBox = document.getElementById('exportOptions');
    exportBox401status = (exportBox.style.display === 'flex') ? 'none' : 'flex';
});