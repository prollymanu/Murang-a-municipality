document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.getElementById('supportForm');
    const fileInput = document.getElementById('supportFiles');
    const fileUploadLabel = document.getElementById('fileUploadLabel');
    const filePreview = document.getElementById('filePreview');
    const successModal = document.getElementById('successModal');
    const modalCloseBtn = document.querySelector('.close-btn');
    const modalOkBtn = document.getElementById('modalOkBtn');
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    let uploadedFiles = [];
    
    // Toggle sidebar on mobile
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Handle drag and drop
    const fileUploadArea = document.querySelector('.file-upload');
    
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'rgba(46, 125, 50, 0.1)';
    });
    
    fileUploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = 'var(--medium-gray)';
        this.style.backgroundColor = '';
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--medium-gray)';
        this.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
            fileInput.files = e.dataTransfer.files;
        }
    });
    
    // Handle form submission
    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!subject || !message) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Prepare form data
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('message', message);
        
        // Add files to form data
        for (let i = 0; i < uploadedFiles.length; i++) {
            formData.append('attachments', uploadedFiles[i]);
        }
        
        // Show loading state
        const submitBtn = supportForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset form
            supportForm.reset();
            filePreview.innerHTML = '';
            uploadedFiles = [];
            fileUploadLabel.textContent = 'Click to upload or drag and drop';
            
            // Show success modal
            successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }, 1500);
    });
    
    // Close modal
    modalCloseBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    modalOkBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    function handleFiles(files) {
        filePreview.innerHTML = '';
        uploadedFiles = [];
        
        if (files.length === 0) {
            fileUploadLabel.textContent = 'Click to upload or drag and drop';
            return;
        }
        
        if (files.length > 3) {
            showToast('You can upload a maximum of 3 files', 'error');
            fileInput.value = '';
            return;
        }
        
        let validFiles = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                showToast(`"${file.name}" is not a supported file type`, 'error');
                continue;
            }
            
            // Validate file size
            if (file.size > maxFileSize) {
                showToast(`"${file.name}" exceeds 5MB limit`, 'error');
                continue;
            }
            
            validFiles.push(file);
            
            // Create file preview
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            const fileIcon = document.createElement('i');
            if (file.type.includes('image')) {
                fileIcon.className = 'fas fa-image';
            } else if (file.type.includes('pdf')) {
                fileIcon.className = 'fas fa-file-pdf';
            } else {
                fileIcon.className = 'fas fa-file';
            }
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            fileName.title = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove file';
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeFile(i);
            });
            
            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            filePreview.appendChild(fileItem);
        }
        
        uploadedFiles = validFiles;
        
        if (uploadedFiles.length === 0) {
            fileUploadLabel.textContent = 'Click to upload or drag and drop';
            fileInput.value = '';
        } else if (uploadedFiles.length === 1) {
            fileUploadLabel.textContent = uploadedFiles[0].name;
        } else {
            fileUploadLabel.textContent = `${uploadedFiles.length} files selected`;
        }
    }
    
    function removeFile(index) {
        uploadedFiles.splice(index, 1);
        
        // Update the file input
        const dataTransfer = new DataTransfer();
        uploadedFiles.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
        
        // Refresh preview
        handleFiles(fileInput.files);
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = type === 'error' ? 'var(--danger-color)' : 'var(--success-color)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '1000';
        toast.style.animation = 'fadeIn 0.3s';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Add animation for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
});