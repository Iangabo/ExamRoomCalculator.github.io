class N8nIntegration {
    constructor() {
        this.N8N_WEBHOOK_URL = 'https://iancamero0611.app.n8n.cloud/webhook/41bac6d2-8d6d-4c1c-8e87-5dc568f37e62';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.createSyncButton();
        this.createStatusIndicator();
        this.addEventListeners();
    }

    // Crear botón de sincronización
    createSyncButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'n8n-controls';
        buttonContainer.innerHTML = `
            <div class="sync-container">
                <button id="syncToAirtable" class="sync-btn">
                    <i class="fas fa-cloud-upload-alt"></i>
                    Sync to Airtable via n8n
                </button>
                <div id="sync-status" class="sync-status"></div>
            </div>
        `;

        // Insertar después del header
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(buttonContainer, header.nextSibling);
        } else {
            document.body.insertBefore(buttonContainer, document.body.firstChild);
        }

        // Agregar estilos
        this.addStyles();
    }

    // Crear indicador de estado
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

    // Agregar estilos CSS
    addStyles() {
        const styles = `
            <style>
                .n8n-controls {
                    background: linear-gradient(135deg, #FF6D5A 0%, #FF5722 100%);
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .sync-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .sync-btn {
                    background: linear-gradient(45deg, #FF6D5A, #FF5722);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 109, 90, 0.3);
                }

                .sync-btn:hover:not(:disabled) {
                    background: linear-gradient(45deg, #FF5722, #FF6D5A);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 109, 90, 0.4);
                }

                .sync-btn:disabled {
                    background: #cccccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .sync-btn.loading {
                    background: linear-gradient(45deg, #ff9800, #f57c00);
                }

                .sync-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                }

                .status-ready {
                    color: #E8F5E8;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-loading {
                    color: #FFF3E0;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-success {
                    color: #E8F5E8;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-error {
                    color: #FFEBEE;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #FF6D5A;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .webhook-config {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 10px;
                    font-size: 12px;
                    color: white;
                    backdrop-filter: blur(10px);
                }

                .webhook-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                    font-size: 12px;
                    margin-top: 5px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    backdrop-filter: blur(5px);
                }

                .webhook-input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .config-btn {
                    margin-top: 5px;
                    padding: 5px 10px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .config-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                @media (max-width: 768px) {
                    .sync-container {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .sync-btn {
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

    // Agregar event listeners
    addEventListeners() {
        const syncButton = document.getElementById('syncToAirtable');
        if (syncButton) {
            syncButton.addEventListener('click', () => this.syncAllData());
        }

        // Agregar configuración de webhook si no está configurado
        if (this.N8N_WEBHOOK_URL.includes('tu-instancia')) {
            this.showWebhookConfig();
        }
    }

    // Mostrar configuración de webhook
    showWebhookConfig() {
        const syncContainer = document.querySelector('.sync-container');
        if (syncContainer) {
            const configDiv = document.createElement('div');
            configDiv.className = 'webhook-config';
            configDiv.innerHTML = `
                <strong>⚙️ Configuración de n8n requerida:</strong><br>
                Por favor, reemplaza la URL del webhook de n8n:<br>
                <input type="text" class="webhook-input" placeholder="https://tu-instancia.app.n8n.cloud/webhook/hospital-data" id="webhook-input">
                <button class="config-btn" onclick="n8nIntegration.updateWebhookUrl()">Actualizar Webhook</button>
                <div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">
                    💡 Copia la URL de tu webhook desde n8n después de crear el workflow
                </div>
            `;
            syncContainer.appendChild(configDiv);
        }
    }

    // Actualizar URL del webhook
    updateWebhookUrl() {
        const input = document.getElementById('webhook-input');
        if (input && input.value.trim()) {
            this.N8N_WEBHOOK_URL = input.value.trim();
            document.querySelector('.webhook-config').remove();
            this.updateStatus('ready', 'n8n Webhook configurado - Listo para sincronizar');
        }
    }

    // Obtener todos los datos calculados
    getAllCalculatedData() {
        const data = [];
        const activeYearButtons = document.querySelectorAll(".year-button.active");
        
        if (activeYearButtons.length === 0) {
            throw new Error('No hay años seleccionados. Por favor, selecciona al menos un año para sincronizar.');
        }

        activeYearButtons.forEach(btn => {
            const year = parseInt(btn.dataset.year, 10);
            
            // Obtener datos de volumen promedio
            const avgVolumeData = this.getRowData(year, 'average');
            if (avgVolumeData) {
                data.push({
                    ...avgVolumeData,
                    calculation_type: 'Average Volume',
                    timestamp: new Date().toISOString(),
                    source: 'Hospital Calculator',
                    sync_method: 'n8n_webhook'
                });
            }

            // Obtener datos de volumen pico
            const peakVolumeData = this.getRowData(year, 'peak');
            if (peakVolumeData) {
                data.push({
                    ...peakVolumeData,
                    calculation_type: 'Peak Month Volume',
                    timestamp: new Date().toISOString(),
                    source: 'Hospital Calculator',
                    sync_method: 'n8n_webhook'
                });
            }
        });

        return data;
    }

    // Obtener datos de una fila específica
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

    // Enviar datos a n8n
    async sendDataToN8n(dataArray) {
        if (this.N8N_WEBHOOK_URL.includes('tu-instancia')) {
            throw new Error('Por favor, configura tu URL de webhook de n8n primero.');
        }

        const results = [];
        
        // Enviar datos de uno en uno para mejor control
        for (const data of dataArray) {
            try {
                console.log('Enviando a n8n:', data);
                
                const response = await fetch(this.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                // n8n puede devolver JSON o texto plano
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
                
                // Pequeña pausa entre requests para evitar saturar n8n
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error('Error enviando a n8n:', error);
                results.push({ 
                    success: false, 
                    data: data, 
                    error: error.message 
                });
            }
        }

        return results;
    }

    // Sincronizar todos los datos
    async syncAllData() {
        if (this.isLoading) return;

        this.isLoading = true;
        const syncButton = document.getElementById('syncToAirtable');
        
        try {
            // Actualizar UI
            syncButton.disabled = true;
            syncButton.innerHTML = '<div class="spinner"></div> Syncing via n8n...';
            this.updateStatus('loading', 'Preparando datos para n8n...');

            // Obtener datos
            const dataToSync = this.getAllCalculatedData();
            
            if (dataToSync.length === 0) {
                throw new Error('No hay datos para sincronizar.');
            }

            this.updateStatus('loading', `Enviando ${dataToSync.length} registros a n8n...`);

            // Enviar a n8n
            const results = await this.sendDataToN8n(dataToSync);

            // Analizar resultados
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (failed === 0) {
                this.updateStatus('success', `✅ ${successful} registros procesados por n8n → Airtable`);
                this.showNotification(`¡${successful} registros sincronizados exitosamente a través de n8n!`, 'success');
            } else {
                const errorMessages = results
                    .filter(r => !r.success)
                    .map(r => r.error)
                    .join(', ');
                
                this.updateStatus('error', `⚠️ ${successful} exitosos, ${failed} fallidos`);
                this.showNotification(`Sincronización parcial: ${successful} exitosos, ${failed} fallidos. Errores: ${errorMessages}`, 'warning');
            }

            // Log detallado para debugging
            console.log('Resultados de sincronización n8n:', results);

        } catch (error) {
            console.error('Error syncing data via n8n:', error);
            this.updateStatus('error', `❌ Error: ${error.message}`);
            this.showNotification(`Error en n8n: ${error.message}`, 'error');
        } finally {
            // Restaurar UI
            this.isLoading = false;
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync to Airtable via n8n';
            
            // Volver al estado ready después de 5 segundos
            setTimeout(() => {
                this.updateStatus('ready', 'Ready to sync with n8n');
            }, 5000);
        }
    }

    // Actualizar estado visual
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

    // Mostrar notificación
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

        // Agregar estilos de notificación si no existen
        if (!document.getElementById('notification-styles')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'notification-styles';
            notificationStyles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    padding: 15px 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    border-left: 4px solid;
                }

                .notification-success { border-left-color: #FF6D5A; }
                .notification-error { border-left-color: #f44336; }
                .notification-warning { border-left-color: #ff9800; }
                .notification-info { border-left-color: #2196F3; }

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

                .notification-success .notification-content { color: #FF6D5A; }
                .notification-error .notification-content { color: #f44336; }
                .notification-warning .notification-content { color: #ff9800; }
                .notification-info .notification-content { color: #2196F3; }
            `;
            document.head.appendChild(notificationStyles);
        }

        // Mostrar notificación
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-ocultar después de 8 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }

    // Método para testing
    testConnection() {
        return fetch(this.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: true,
                message: 'Prueba de conexión desde Hospital Calculator',
                timestamp: new Date().toISOString()
            })
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.n8nIntegration = new N8nIntegration();
        console.log('n8n Integration loaded successfully');
    }, 1000);
});

// También inicializar si el DOM ya está listo
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