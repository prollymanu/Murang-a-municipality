document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.querySelector('.filter-controls');
    if (filterForm) {
        filterForm.addEventListener('change', function() {
            this.submit();
        });
    }
});