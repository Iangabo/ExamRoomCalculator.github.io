// zapier-integration.js
// Script para integrar la calculadora con Zapier/Airtable

class ZapierIntegration {
    constructor() {
        // REEMPLAZA ESTA URL CON TU WEBHOOK DE ZAPIER
        this.ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/23231931/2v09pr4/';
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
        buttonContainer.className = 'zapier-controls';
        buttonContainer.innerHTML = `
            <div class="sync-container">
                <button id="syncToAirtable" class="sync-btn">
                    <i class="fas fa-cloud-upload-alt"></i>
                    Sync to Airtable
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
                    Ready to sync
                </div>
            `;
        }
    }

    // Agregar estilos CSS
    addStyles() {
        const styles = `
            <style>
                .zapier-controls {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                    background: linear-gradient(45deg, #4CAF50, #45a049);
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
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }

                .sync-btn:hover:not(:disabled) {
                    background: linear-gradient(45deg, #45a049, #4CAF50);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
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
                }

                .status-ready {
                    color: #4CAF50;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-loading {
                    color: #ff9800;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-success {
                    color: #4CAF50;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .status-error {
                    color: #f44336;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #ff9800;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .webhook-config {
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 10px;
                    font-size: 12px;
                    color: #666;
                }

                .webhook-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-top: 5px;
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
        
        if (!document.getElementById('zapier-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'zapier-styles';
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
        if (this.ZAPIER_WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
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
                <strong>⚠️ Configuración requerida:</strong><br>
                Por favor, reemplaza la URL del webhook en el código:<br>
                <input type="text" class="webhook-input" placeholder="Pega aquí tu URL de webhook de Zapier" id="webhook-input">
                <button onclick="zapierIntegration.updateWebhookUrl()" style="margin-top: 5px; padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Actualizar</button>
            `;
            syncContainer.appendChild(configDiv);
        }
    }

    // Actualizar URL del webhook
    updateWebhookUrl() {
        const input = document.getElementById('webhook-input');
        if (input && input.value.trim()) {
            this.ZAPIER_WEBHOOK_URL = input.value.trim();
            document.querySelector('.webhook-config').remove();
            this.updateStatus('ready', 'Webhook configurado - Listo para sincronizar');
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
                    timestamp: new Date().toISOString()
                });
            }

            // Obtener datos de volumen pico
            const peakVolumeData = this.getRowData(year, 'peak');
            if (peakVolumeData) {
                data.push({
                    ...peakVolumeData,
                    calculation_type: 'Peak Month Volume',
                    timestamp: new Date().toISOString()
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

    // Enviar datos a Zapier
    async sendDataToZapier(dataArray) {
    if (this.ZAPIER_WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
        throw new Error('Por favor, configura tu URL de webhook de Zapier primero.');
    }

    const results = [];
    
    for (const data of dataArray) {
        try {
            const response = await fetch(this.ZAPIER_WEBHOOK_URL, {
                method: 'POST',
                // Remover el header Content-Type para evitar preflight
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            results.push({ success: true, data: data, response: result });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            results.push({ success: false, data: data, error: error.message });
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
            syncButton.innerHTML = '<div class="spinner"></div> Syncing...';
            this.updateStatus('loading', 'Preparando datos...');

            // Obtener datos
            const dataToSync = this.getAllCalculatedData();
            
            if (dataToSync.length === 0) {
                throw new Error('No hay datos para sincronizar.');
            }

            this.updateStatus('loading', `Enviando ${dataToSync.length} registros...`);

            // Enviar a Zapier
            const results = await this.sendDataToZapier(dataToSync);

            // Analizar resultados
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (failed === 0) {
                this.updateStatus('success', `✅ ${successful} registros sincronizados exitosamente`);
                this.showNotification('Datos sincronizados exitosamente con Airtable!', 'success');
            } else {
                this.updateStatus('error', `⚠️ ${successful} exitosos, ${failed} fallidos`);
                this.showNotification(`Sincronización parcial: ${successful} exitosos, ${failed} fallidos`, 'warning');
            }

        } catch (error) {
            console.error('Error syncing data:', error);
            this.updateStatus('error', `❌ Error: ${error.message}`);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            // Restaurar UI
            this.isLoading = false;
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync to Airtable';
            
            // Volver al estado ready después de 5 segundos
            setTimeout(() => {
                this.updateStatus('ready', 'Ready to sync');
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
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                ${message}
            </div>
        `;

        // Agregar estilos de notificación
        if (!document.getElementById('notification-styles')) {
            const notificationStyles = `
                <style id="notification-styles">
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

                    .notification-success { border-left-color: #4CAF50; }
                    .notification-error { border-left-color: #f44336; }
                    .notification-warning { border-left-color: #ff9800; }
                    .notification-info { border-left-color: #2196F3; }

                    .notification.show {
                        transform: translateX(0);
                    }

                    .notification-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 14px;
                        font-weight: 500;
                    }

                    .notification-success .notification-content { color: #4CAF50; }
                    .notification-error .notification-content { color: #f44336; }
                    .notification-warning .notification-content { color: #ff9800; }
                    .notification-info .notification-content { color: #2196F3; }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', notificationStyles);
        }

        // Mostrar notificación
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que otros scripts se hayan cargado
    setTimeout(() => {
        window.zapierIntegration = new ZapierIntegration();
        console.log('Zapier Integration loaded successfully');
    }, 1000);
});

// También inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (!window.zapierIntegration) {
                window.zapierIntegration = new ZapierIntegration();
                console.log('Zapier Integration loaded successfully');
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (!window.zapierIntegration) {
            window.zapierIntegration = new ZapierIntegration();
            console.log('Zapier Integration loaded successfully');
        }
    }, 1000);
}