class N8nIntegration {
    constructor() {
        this.N8N_WEBHOOK_URL = 'https://iancamero0611.app.n8n.cloud/webhook/41bac6d2-8d6d-4c1c-8e87-5dc568f37e62';
        this.isLoading = false;
        this.hcfCounter = 1; // Hospital Calc File counter
        this.init();
    }

    init() {
        this.createSyncButton();
        this.createStatusIndicator();
        this.addEventListeners();
    }

    // Create sync button with updated design
    createSyncButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'n8n-controls';
        buttonContainer.innerHTML = `
        <div class="sync-container with-title">
            <h2 class="sync-title">Validating Key Planning Units</h2>
            <button id="syncToAirtable" class="sync-btn">
                <i class="fas fa-cloud-upload-alt"></i>
                Sync to Airtable via n8n
            </button>
            <div id="sync-status" class="sync-status"></div>
        </div>
    `;



        // Insert after header
        const header = document.getElementById('header')
        header.appendChild(buttonContainer)


        // const header = document.querySelector('header');
        // if (header && header.nextSibling) {
        //     header.parentNode.insertBefore(buttonContainer, header.nextSibling);
        // } else {
        //     document.body.insertBefore(buttonContainer, document.body.firstChild);
        // }

        // Add styles
        this.addStyles();
    }

    // Create status indicator
    createStatusIndicator() {
        const statusDiv = document.getElementById('sync-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="status-ready">
                    <i class="fas fa-check-circle"></i>
                    Ready to sync with n8n
                </div>
            `;
        }
    }

    // Add CSS styles with #088eb0 color scheme
    addStyles() {
        const styles = `
            <style>
                .n8n-controls {
                    background: linear-gradient(135deg, #088eb0 0%, #065a73 100%);
                    padding: 15px;
                    margin: 0px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(8, 142, 176, 0.2);
                }
                
                .sync-header {
                    width: 100%;
                    margin-bottom: 10px;
                }

                .sync-title {
                    margin: 0;
                    padding: 0;
                    text-align: left !important;
                    font-size: 30px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 0px;
                }

                .sync-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .sync-btn {
                    background: linear-gradient(45deg, #088eb0, #065a73);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: Helvetica;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(8, 142, 176, 0.3);
                    margin: auto;
                }

                .sync-btn:hover:not(:disabled) {
                    background: linear-gradient(45deg, #0aa5cc, #088eb0);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(8, 142, 176, 0.4);
                }

                .sync-btn:disabled {
                    background: #cccccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                    
                }

                .sync-btn.loading {
                    background: linear-gradient(45deg, #0aa5cc, #088eb0);
                }

                .sync-status {
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    display: block;
                    margin: 0 auto;
                }

                .status-ready, .status-loading, .status-success, .status-error {
                    color: #E8F8FB;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-loading { color: #FFF8E1; }
                .status-success { color: #E8F5E8; }
                .status-error { color: #FFEBEE; }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #088eb0;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* HCF Modal Styles */
                .hcf-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }

                .hcf-modal-content {
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 10px 30px rgba(8, 142, 176, 0.3);
                    animation: modalAppear 0.3s ease-out;
                }

                @keyframes modalAppear {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .hcf-modal-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #088eb0;
                }

                .hcf-modal-header h3 {
                    margin: 0;
                    color: #088eb0;
                    font-size: 20px;
                    font-weight: bold;
                }

                .hcf-modal-header i {
                    color: #088eb0;
                    font-size: 24px;
                }

                .hcf-form-group {
                    margin-bottom: 20px;
                }

                .hcf-form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                }

                .hcf-form-group input,
                .hcf-form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                    box-sizing: border-box;
                }

                .hcf-form-group input:focus,
                .hcf-form-group textarea:focus {
                    outline: none;
                    border-color: #088eb0;
                    box-shadow: 0 0 0 3px rgba(8, 142, 176, 0.1);
                }

                .hcf-form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .hcf-modal-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                    margin-top: 30px;
                }

                .hcf-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hcf-btn-primary {
                    background: linear-gradient(45deg, #088eb0, #065a73);
                    color: white;
                    box-shadow: 0 4px 15px rgba(8, 142, 176, 0.3);
                }

                .hcf-btn-primary:hover {
                    background: linear-gradient(45deg, #0aa5cc, #088eb0);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(8, 142, 176, 0.4);
                }

                .hcf-btn-secondary {
                    background: #f5f5f5;
                    color: #666;
                    border: 2px solid #e0e0e0;
                }

                .hcf-btn-secondary:hover {
                    background: #e0e0e0;
                    transform: translateY(-1px);
                }

                .hcf-info {
                    background: rgba(8, 142, 176, 0.1);
                    border-left: 4px solid #088eb0;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .hcf-info p {
                    margin: 0;
                    color: #065a73;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .hcf-id-display {
                    background: linear-gradient(45deg, #088eb0, #065a73);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    display: inline-block;
                    margin-bottom: 15px;
                }

                /* Notification styles */
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    padding: 15px 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 10001;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    border-left: 4px solid;
                }

                .notification-success { border-left-color: #088eb0; }
                .notification-error { border-left-color: #f44336; }
                .notification-warning { border-left-color: #ff9800; }
                .notification-info { border-left-color: #088eb0; }

                .notification.show { transform: translateX(0); }

                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: auto;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .notification-close:hover { opacity: 1; }

                .notification-success .notification-content { color: #088eb0; }
                .notification-error .notification-content { color: #f44336; }
                .notification-warning .notification-content { color: #ff9800; }
                .notification-info .notification-content { color: #088eb0; }

                @media (max-width: 768px) {
                    .sync-container {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .sync-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .hcf-modal-content {
                        margin: 20px;
                        width: auto;
                    }

                    .hcf-modal-buttons {
                        flex-direction: column;
                    }

                    .hcf-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        `;
        
        if (!document.getElementById('n8n-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'n8n-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }
    }

    // Add event listeners
    addEventListeners() {
        const syncButton = document.getElementById('syncToAirtable');
        if (syncButton) {
            syncButton.addEventListener('click', () => this.showHCFModal());
        }

        // Add webhook configuration if not configured
        if (this.N8N_WEBHOOK_URL.includes('tu-instancia')) {
            this.showWebhookConfig();
        }
    }

    // Show HCF (Hospital Calc File) modal before sync
    showHCFModal() {
        const modal = document.createElement('div');
        modal.className = 'hcf-modal';
        modal.innerHTML = `
            <div class="hcf-modal-content">
                <div class="hcf-modal-header">
                    <i class="fas fa-file-medical"></i>
                    <h3>Create Hospital Calc File (HCF)</h3>
                </div>
                
                <div class="hcf-id-display">
                    <i class="fas fa-hashtag"></i> HCF ID: ${this.hcfCounter}
                </div>

                <div class="hcf-info">
                    <p><strong>About HCF:</strong> Each sync creates a Hospital Calc File that captures your input values and calculated results. This helps track different scenarios and project variations.</p>
                </div>

                <form id="hcfForm">
                    <div class="hcf-form-group">
                        <label for="projectName">
                            <i class="fas fa-hospital"></i> Project Name *
                        </label>
                        <input 
                            type="text" 
                            id="projectName" 
                            name="projectName" 
                            placeholder="e.g., Hospital Cerro Colorado ESSALUD"
                            required
                        />
                    </div>

                    <div class="hcf-form-group">
                        <label for="projectDescription">
                            <i class="fas fa-align-left"></i> Project Description *
                        </label>
                        <textarea 
                            id="projectDescription" 
                            name="projectDescription" 
                            placeholder="e.g., Using data from 1980-2010 with 15% growth projection"
                            required
                        ></textarea>
                    </div>
                </form>

                <div class="hcf-modal-buttons">
                    <button type="button" class="hcf-btn hcf-btn-secondary" onclick="this.closest('.hcf-modal').remove()">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    <button type="button" class="hcf-btn hcf-btn-primary" onclick="n8nIntegration.createHCFAndSync()">
                        <i class="fas fa-save"></i>
                        Create HCF & Sync
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('#projectName');
            if (firstInput) firstInput.focus();
        }, 100);

        // Handle form submission with Enter key
        const form = modal.querySelector('#hcfForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createHCFAndSync();
        });
    }

    // Create HCF and proceed with sync
    async createHCFAndSync() {
        const modal = document.querySelector('.hcf-modal');
        const projectName = document.getElementById('projectName').value.trim();
        const projectDescription = document.getElementById('projectDescription').value.trim();

        // Validate inputs
        if (!projectName || !projectDescription) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Create HCF data
        const hcfData = {
            id: this.hcfCounter,
            creation_date: new Date().toISOString(),
            project_name: projectName,
            project_description: projectDescription
        };

        // Close modal
        modal.remove();

        // Increment counter for next HCF
        this.hcfCounter++;

        // Start sync process
        await this.syncAllData(hcfData);
    }

    // Get all calculated data with HCF information
    getAllCalculatedData(hcfData) {
        const data = [];
        const activeYearButtons = document.querySelectorAll(".year-button.active");
        
        if (activeYearButtons.length === 0) {
            throw new Error('No years selected. Please select at least one year to sync.');
        }

        activeYearButtons.forEach(btn => {
            const year = parseInt(btn.dataset.year, 10);
            
            // Get average volume data
            const avgVolumeData = this.getRowData(year, 'average');
            if (avgVolumeData) {
                data.push({
                    ...avgVolumeData,
                    ...hcfData, // Include HCF data
                    calculation_type: 'Average Volume',
                    timestamp: new Date().toISOString(),
                    source: 'Hospital Calculator',
                    sync_method: 'n8n_webhook'
                });
            }

            // Get peak volume data
            const peakVolumeData = this.getRowData(year, 'peak');
            if (peakVolumeData) {
                data.push({
                    ...peakVolumeData,
                    ...hcfData, // Include HCF data
                    calculation_type: 'Peak Month Volume',
                    timestamp: new Date().toISOString(),
                    source: 'Hospital Calculator',
                    sync_method: 'n8n_webhook'
                });
            }
        });

        return data;
    }

    // Get data from specific row
    getRowData(year, type) {
        let visitsElement, roomsElement, providersElement, productivityElement;

        if (type === 'average') {
            visitsElement = document.getElementById(`visits${year}`);
            roomsElement = document.getElementById(`rooms${year}`);
            providersElement = document.getElementById(`providers${year}`);
            productivityElement = document.getElementById(`productivity${year}`);
        } else if (type === 'peak') {
            visitsElement = document.getElementById(`visitsPeak${year}`);
            roomsElement = document.getElementById(`roomsPeak${year}`);
            providersElement = document.getElementById(`providersPeak${year}`);
            productivityElement = document.getElementById(`productivityPeak${year}`);
        }

        if (!visitsElement || !roomsElement || !providersElement || !productivityElement) {
            return null;
        }

        return {
            year: year,
            annual_visits: parseInt(visitsElement.textContent) || 0,
            rooms_needed: parseInt(roomsElement.textContent) || 0,
            providers_needed: parseInt(providersElement.textContent) || 0,
            provider_productivity: parseFloat(productivityElement.textContent) || 0
        };
    }

    // Send data to n8n with CORS handling
    async sendDataToN8n(dataArray) {
        if (this.N8N_WEBHOOK_URL.includes('tu-instancia')) {
            throw new Error('Please configure your n8n webhook URL first.');
        }

        const results = [];
        
        // Send data one by one for better control
        for (const data of dataArray) {
            try {
                console.log('Sending to n8n:', data);
                
                // Prepare request with CORS handling
                const requestOptions = {
                    method: 'POST',
                    mode: 'cors', // Handle CORS explicitly
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(data)
                };

                const response = await fetch(this.N8N_WEBHOOK_URL, requestOptions);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                // n8n can return JSON or plain text
                let result;
                try {
                    result = await response.json();
                } catch {
                    result = await response.text();
                }

                results.push({ 
                    success: true, 
                    data: data, 
                    response: result,
                    status: response.status 
                });
                
                // Small pause between requests to avoid saturating n8n
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error('Error sending to n8n:', error);
                
                // Handle different types of errors
                let errorMessage = error.message;
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Network error - check your internet connection and n8n webhook URL';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'CORS error - n8n webhook may not allow cross-origin requests';
                }
                
                results.push({ 
                    success: false, 
                    data: data, 
                    error: errorMessage 
                });
            }
        }

        return results;
    }

    // Sync all data with HCF information
    async syncAllData(hcfData) {
        if (this.isLoading) return;

        this.isLoading = true;
        const syncButton = document.getElementById('syncToAirtable');
        
        try {
            // Update UI
            syncButton.disabled = true;
            syncButton.innerHTML = '<div class="spinner"></div> Syncing via n8n...';
            this.updateStatus('loading', 'Preparing HCF data for n8n...');

            // Get data
            const dataToSync = this.getAllCalculatedData(hcfData);
            
            if (dataToSync.length === 0) {
                throw new Error('No data to sync.');
            }

            this.updateStatus('loading', `Sending HCF #${hcfData.id} with ${dataToSync.length} records to n8n...`);

            // Send to n8n
            const results = await this.sendDataToN8n(dataToSync);

            // Analyze results
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (failed === 0) {
                this.updateStatus('success', `✅ HCF #${hcfData.id}: ${successful} records processed via n8n → Airtable`);
                this.showNotification(`HCF #${hcfData.id} "${hcfData.project_name}" synced successfully! ${successful} records processed.`, 'success');
            } else {
                const errorMessages = results
                    .filter(r => !r.success)
                    .map(r => r.error)
                    .join(', ');
                
                this.updateStatus('error', `⚠️ HCF #${hcfData.id}: ${successful} successful, ${failed} failed`);
                this.showNotification(`HCF #${hcfData.id} partial sync: ${successful} successful, ${failed} failed. Errors: ${errorMessages}`, 'warning');
            }

            // Detailed log for debugging
            console.log('n8n sync results:', results);

        } catch (error) {
            console.error('Error syncing data via n8n:', error);
            this.updateStatus('error', `❌ Error: ${error.message}`);
            this.showNotification(`n8n Error: ${error.message}`, 'error');
        } finally {
            // Restore UI
            this.isLoading = false;
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync to Airtable via n8n';
            
            // Return to ready state after 5 seconds
            setTimeout(() => {
                this.updateStatus('ready', 'Ready to sync with n8n');
            }, 5000);
        }
    }

    // Update visual status
    updateStatus(type, message) {
        const statusDiv = document.getElementById('sync-status');
        if (!statusDiv) return;

        const icons = {
            ready: 'fas fa-check-circle',
            loading: 'spinner',
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle'
        };

        const classes = {
            ready: 'status-ready',
            loading: 'status-loading',
            success: 'status-success',
            error: 'status-error'
        };

        const iconHtml = type === 'loading' 
            ? '<div class="spinner"></div>' 
            : `<i class="${icons[type]}"></i>`;

        statusDiv.innerHTML = `
            <div class="${classes[type]}">
                ${iconHtml}
                ${message}
            </div>
        `;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}-circle"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Show notification
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }

    // Method for testing connection
    async testConnection() {
        try {
            const response = await fetch(this.N8N_WEBHOOK_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    test: true,
                    message: 'Connection test from Hospital Calculator',
                    timestamp: new Date().toISOString()
                })
            });
            return response;
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.n8nIntegration = new N8nIntegration();
        console.log('n8n Integration loaded successfully');
    }, 1000);
});

// Also initialize if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (!window.n8nIntegration) {
                window.n8nIntegration = new N8nIntegration();
                console.log('n8n Integration loaded successfully');
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (!window.n8nIntegration) {
            window.n8nIntegration = new N8nIntegration();
            console.log('n8n Integration loaded successfully');
        }
    }, 1000);
}