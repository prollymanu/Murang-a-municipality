function addIssueRow() {
    const container = document.getElementById('issue-container');
    const newRow = document.createElement('div');
    newRow.className = 'issue-row';
    newRow.innerHTML = `
      <input type="text" name="issue_title[]" placeholder="Issue Title" class="form-control" required>
      <input type="text" name="issue_description[]" placeholder="Issue Description" class="form-control" required>
      <select name="priority[]" class="form-control" required>
        <option value="">Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input type="number" name="estimated_cost[]" placeholder="Cost (Ksh)" class="form-control" required>
      <button type="button" onclick="removeRow(this)">❌</button>
    `;
    container.appendChild(newRow);
  }
  
  function removeRow(button) {
    button.parentElement.remove();
  }
  