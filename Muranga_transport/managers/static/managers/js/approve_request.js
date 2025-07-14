document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll('.revised-cost-input');

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const original = parseFloat(input.dataset.original);
      const revised = parseFloat(input.value);
      const diffElement = document.getElementById(`cost_diff_${input.id.split('_').pop()}`);

      if (!isNaN(revised)) {
        const diff = revised - original;
        const sign = diff >= 0 ? '+' : '-';
        diffElement.textContent = `Difference: ${sign}Ksh ${Math.abs(diff).toFixed(2)}`;
        diffElement.style.color = diff >= 0 ? 'green' : 'red';
      } else {
        diffElement.textContent = '';
      }
    });
  });
});
