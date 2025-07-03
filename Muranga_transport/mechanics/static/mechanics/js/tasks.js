document.addEventListener('DOMContentLoaded', function () {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    document.querySelectorAll('.btn-update-progress').forEach(button => {
        button.addEventListener('click', () => {
            const updateUrl = button.dataset.updateUrl;
            const newProgress = prompt("Enter new progress percentage (0-100):");
            if (newProgress === null) return;  // User cancelled
            const progressInt = parseInt(newProgress);
            if (isNaN(progressInt) || progressInt < 0 || progressInt > 100) {
                alert("Invalid progress value.");
                return;
            }

            fetch(updateUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ progress: progressInt })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Progress updated successfully!");
                    window.location.reload();
                } else {
                    alert(data.error || "Failed to update progress.");
                }
            })
            .catch(err => alert("Request failed: " + err));
        });
    });

    document.querySelectorAll('.btn-complete-task').forEach(button => {
        button.addEventListener('click', () => {
            if (!confirm("Are you sure you want to mark this task as completed?")) return;
            const completeUrl = button.dataset.completeUrl;

            fetch(completeUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Task marked as completed!");
                    window.location.reload();
                } else {
                    alert(data.error || "Failed to complete task.");
                }
            })
            .catch(err => alert("Request failed: " + err));
        });
    });
});
