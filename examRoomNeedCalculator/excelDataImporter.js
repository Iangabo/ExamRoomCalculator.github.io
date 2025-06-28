document.addEventListener("DOMContentLoaded", function() {
    const CSS_STYLES = {
        importButton: {
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "-1000px",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease"
        },
        importButtonHover: {
            backgroundColor: "#45a049",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        },
        successMessage: {
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: "1000",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            border: "1px solid #45a049"
        },
        errorMessage: {
            backgroundColor: "#f44336",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: "1000",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
            border: "1px solid #d32f2f"
        }
    };

    // ============== FUNCIONES DE UTILIDAD PARA CSS ==============
    function applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    function createStyledElement(tagName, styles, innerHTML = '') {
        const element = document.createElement(tagName);
        if (innerHTML) element.innerHTML = innerHTML;
        applyStyles(element, styles);
        return element;
    }

    // ============== VARIABLES GLOBALES ==============
    window.roomUtilizationTarget = window.roomUtilizationTarget || 75; 
    
    // Create getPrecalculatedData function if it does not exist
    window.getPrecalculatedData = window.getPrecalculatedData || function() {
        const activeYears = Array.from(document.querySelectorAll(".year-button.active"))
            .map(btn => parseInt(btn.dataset.year));
        
        return activeYears.map(year => {
            return {
                year: year,
                rooms: parseFloat(document.getElementById("rooms" + year)?.textContent || 0),
                providers: parseFloat(document.getElementById("providers" + year)?.textContent || 0),
                visits: parseFloat(document.getElementById("visits" + year)?.textContent || 0)
            };
        });
    };
    
    // ============== CREACIÓN DE LA INTERFAZ ==============
    function createImportInterface() {
        const controlsContainer = document.querySelector(".controls-container") || document.body;
        
        // Crear botón de importación con estilos personalizables
        const importButton = createStyledElement(
            "button",
            CSS_STYLES.importButton,
            '<i class="fas fa-file-excel"></i> Import Excel data'
        );
        importButton.id = "importExcelBtn";
        importButton.className = "import-btn";
        
        // Agregar efectos hover
        importButton.addEventListener("mouseenter", function() {
            applyStyles(this, CSS_STYLES.importButtonHover);
        });
        
        importButton.addEventListener("mouseleave", function() {
            applyStyles(this, CSS_STYLES.importButton);
        });
        
        controlsContainer.appendChild(importButton);
        
        // Crear input de archivo (oculto)
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "excelFileInput";
        fileInput.accept = ".xlsx, .xls";
        fileInput.style.display = "none";
        
        controlsContainer.appendChild(fileInput);
        
        return { importButton, fileInput };
    }
    
    // ============== MANEJO DE EVENTOS ==============
    function setupEventListeners(importButton, fileInput) {
        // Clic en botón de importación
        importButton.addEventListener("click", function() {
            fileInput.click();
        });
        
        // Cambio en input de archivo
        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            showLoadingMessage();
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                processExcelFile(data);
            };
            reader.onerror = function() {
                showMessage("Error al leer el archivo", "error");
            };
            reader.readAsArrayBuffer(file);
        });
    }
    
    // ============== MENSAJES DE ESTADO ==============
    function showMessage(text, type = "success") {
        const messageStyles = type === "success" ? CSS_STYLES.successMessage : CSS_STYLES.errorMessage;
        
        const message = createStyledElement("div", messageStyles, text);
        message.className = `import-${type}`;
        
        document.body.appendChild(message);
        
        // Animación de entrada
        message.style.opacity = "0";
        message.style.transform = "translateX(100%)";
        
        setTimeout(() => {
            message.style.transition = "all 0.3s ease";
            message.style.opacity = "1";
            message.style.transform = "translateX(0)";
        }, 10);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            message.style.opacity = "0";
            message.style.transform = "translateX(100%)";
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
    
    function showLoadingMessage() {
        const loading = createStyledElement(
            "div",
            {
                ...CSS_STYLES.successMessage,
                backgroundColor: "#2196F3"
            },
            "Procesando archivo Excel..."
        );
        loading.id = "loadingMessage";
        document.body.appendChild(loading);
    }
    
    function hideLoadingMessage() {
        const loading = document.getElementById("loadingMessage");
        if (loading) loading.remove();
    }
    
    // ============== PROCESAMIENTO DE EXCEL ==============
    function processExcelFile(data) {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Buscar hoja de parámetros
            let parametersSheet;
            if (workbook.SheetNames.includes("Parameters")) {
                parametersSheet = "Parameters";
            } else {
                parametersSheet = workbook.SheetNames[0];
            }
            
            const worksheet = workbook.Sheets[parametersSheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                hideLoadingMessage();
                showMessage("No se encontraron datos en el archivo Excel", "error");
                return;
            }
            
            console.log("Datos extraídos:", jsonData);
            
            // Extraer datos y actualizar UI
            extractParametersAndUpdateUI(jsonData, workbook);
            
            hideLoadingMessage();
            showMessage("¡Datos Excel importados correctamente!");
            
        } catch (error) {
            console.error("Error procesando archivo Excel:", error);
            hideLoadingMessage();
            showMessage("Error procesando archivo Excel. Verifique el formato e intente nuevamente.", "error");
        }
    }
    
    // ============== EXTRACCIÓN Y ACTUALIZACIÓN DE DATOS ==============
    function extractParametersAndUpdateUI(jsonData, workbook) {
        const mappings = {
            "Annual Growth Target (%)": "annual-growth-target",
            "Average Clinic Visit Time (min)": "avg-clinic-visit-time",
            "Available Days Per Year": "clinic-operation-days-per-year",
            "Clinic Operation Hours Per Day": "clinic-operation-hours-per-day",
            "Current Exam Rooms Per Provider": "current-exam-rooms-per-provider",
            "Patient Visits": "patient-visits",
            "Peak Month Volume": "peak-month-volume",
            "Provider Productivity Current": "provider-productivity-current",
            "Provider Productivity Target": "provider-productivity-target",
            "Room Utilization Target (%)": "room-utilization-target"
        };
        
        // Procesar parámetros
        for (const row of jsonData) {
            if (row.Parameter && row.Value !== undefined) {
                const paramName = row.Parameter;
                const paramValue = row.Value;
                
                const inputId = mappings[paramName];
                if (inputId) {
                    const inputElement = document.getElementById(inputId);
                    if (inputElement) {
                        inputElement.value = paramValue;
                        const event = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(event);
                    }
                    
                    if (paramName === "Room Utilization Target (%)") {
                        window.roomUtilizationTarget = paramValue;
                    }
                }
                
                // Manejar datos de tiempo de visita
                if (paramName === "MA Visit Time" || paramName === "Wait Time" || paramName === "Provider Visit Time") {
                    handleVisitTimeData(paramName, paramValue);
                }
            }
        }
        
        // Procesar hojas de resultados
        processResultSheets(workbook);
        
        // Actualizar cálculos y gráficos
        updateCalculationsAndCharts();
    }
    
    // ============== PROCESAMIENTO DE HOJAS DE RESULTADOS ==============
    function processResultSheets(workbook) {
        try {
            if (workbook.SheetNames.includes("Results")) {
                const resultsSheet = workbook.Sheets["Results"];
                const resultsData = XLSX.utils.sheet_to_json(resultsSheet);
                if (resultsData.length > 0) {
                    processYearData(resultsData);
                }
            }
            
            if (workbook.SheetNames.includes("Peak Results")) {
                const peakSheet = workbook.Sheets["Peak Results"];
                const peakData = XLSX.utils.sheet_to_json(peakSheet);
                if (peakData.length > 0) {
                    processPeakData(peakData);
                }
            }
        } catch (error) {
            console.error("Error procesando hojas de resultados:", error);
        }
    }
    
    // ============== FUNCIONES DE DATOS ==============
    function handleVisitTimeData(paramName, paramValue) {
        if (!window.breakdownValues) {
            window.breakdownValues = [12.5, 13, 19.5];
        }
        
        switch (paramName) {
            case "MA Visit Time":
                window.breakdownValues[0] = parseFloat(paramValue);
                break;
            case "Wait Time":
                window.breakdownValues[1] = parseFloat(paramValue);
                break;
            case "Provider Visit Time":
                window.breakdownValues[2] = parseFloat(paramValue);
                break;
        }
        
        if (typeof window.updatePieChart === "function") {
            window.updatePieChart();
        }
    }
    
    function processYearData(resultsData) {
        const yearData = [];
        
        resultsData.forEach(row => {
            if (row.Year && !isNaN(parseInt(row.Year))) {
                yearData.push({
                    year: parseInt(row.Year),
                    visits: row.Visits || null,
                    rooms: row.Rooms || null,
                    providers: row.Providers || null,
                    productivity: row.Productivity || null
                });
            }
        });
        
        if (yearData.length > 0) {
            selectYearsFromData(yearData);
            
            yearData.forEach(data => {
                updateTableCellsIfExists("visits", data.year, data.visits);
                updateTableCellsIfExists("rooms", data.year, data.rooms);  
                updateTableCellsIfExists("providers", data.year, data.providers);
                updateTableCellsIfExists("productivity", data.year, data.productivity);
            });
        }
    }
    
    function processPeakData(peakData) {
        peakData.forEach(row => {
            if (row.Year && !isNaN(parseInt(row.Year))) {
                const year = parseInt(row.Year);
                
                updateTableCellsIfExists("visitsPeak", year, row["Peak Visits"]);
                updateTableCellsIfExists("roomsPeak", year, row["Peak Rooms"]);
                updateTableCellsIfExists("providersPeak", year, row["Peak Providers"]);
                updateTableCellsIfExists("productivityPeak", year, row["Peak Productivity"]);
            }
        });
    }
    
    function updateTableCellsIfExists(prefix, year, value) {
        if (value === null || value === undefined) return;
        
        const cellId = prefix + year;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.textContent = value;
        }
    }
    
    function selectYearsFromData(yearData) {
        const functions = {
            hasAddOutputRow: typeof window.addOutputRow === 'function',
            hasAddOutputRowPeak: typeof window.addOutputRowPeak === 'function',
            hasAddOutputRowProviderProductivity: typeof window.addOutputRowProviderProductivity === 'function',
            hasAddOutputRowProviderProductivityPeak: typeof window.addOutputRowProviderProductivityPeak === 'function',
            hasRemoveOutputRow: typeof window.removeOutputRow === 'function',
            hasRemoveOutputRowPeak: typeof window.removeOutputRowPeak === 'function',
            hasRemoveOutputRowProviderProductivity: typeof window.removeOutputRowProviderProductivity === 'function',
            hasRemoveOutputRowProviderProductivityPeak: typeof window.removeOutputRowProviderProductivityPeak === 'function'
        };
        
        // Limpiar años previamente seleccionados
        document.querySelectorAll(".year-button.active").forEach(btn => {
            btn.classList.remove("active");
            const year = parseInt(btn.dataset.year, 10);
            
            if (functions.hasRemoveOutputRow) window.removeOutputRow(year);
            if (functions.hasRemoveOutputRowPeak) window.removeOutputRowPeak(year);
            if (functions.hasRemoveOutputRowProviderProductivity) window.removeOutputRowProviderProductivity(year);
            if (functions.hasRemoveOutputRowProviderProductivityPeak) window.removeOutputRowProviderProductivityPeak(year);
        });
        
        // Seleccionar años de los datos
        yearData.forEach(data => {
            const yearBtn = document.querySelector(`.year-button[data-year="${data.year}"]`);
            if (yearBtn) {
                yearBtn.classList.add("active");
                
                if (functions.hasAddOutputRow) window.addOutputRow(data.year);
                if (functions.hasAddOutputRowPeak) window.addOutputRowPeak(data.year);
                if (functions.hasAddOutputRowProviderProductivity) window.addOutputRowProviderProductivity(data.year);
                if (functions.hasAddOutputRowProviderProductivityPeak) window.addOutputRowProviderProductivityPeak(data.year);
            }
        });
    }
    
    function updateCalculationsAndCharts() {
        if (typeof window.calculateDataForSelectedYears === "function") {
            window.calculateDataForSelectedYears();
        }
        
        if (typeof window.updateChart === "function") {
            window.updateChart(getPrecalculatedData());
        }
        
        if (typeof window.updateDonnutChart === "function") {
            window.updateDonnutChart();
        }
    }
    
    // ============== CARGA DE LIBRERÍAS ==============
    function loadSheetJS() {
        if (typeof XLSX !== 'undefined') return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // ============== FUNCIONES AUXILIARES ==============
    // Implementaciones por defecto de las funciones de tabla
    window.addOutputRow = window.addOutputRow || function(year) {
        console.log(`Función addOutputRow no definida, intentando añadir fila para ${year}`);
        const tbody = document.getElementById("outputTbody");
        if (tbody) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="yearCell">${year}</td>
                <td class="visitsCell" id="visits${year}">0</td>
                <td class="roomsCell" id="rooms${year}">0</td>
                <td class="providersCell" id="providers${year}">0</td>
                <td class="productivityCell" id="productivity${year}">0</td>
            `;
            tbody.appendChild(tr);
        }
    };
    
    window.addOutputRowPeak = window.addOutputRowPeak || function(year) {
        const tbody = document.getElementById("outputTbody2");
        if (tbody) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="yearCell">${year}</td>
                <td id="visitsPeak${year}">0</td>
                <td id="roomsPeak${year}">0</td>
                <td id="providersPeak${year}">0</td>
                <td id="productivityPeak${year}">0</td>
            `;
            tbody.appendChild(tr);
        }
    };
    
    window.addOutputRowProviderProductivity = window.addOutputRowProviderProductivity || function(year) {
        const tbody = document.getElementById("outputTbody3");
        if (tbody) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${year}</td>
                <td id="visitsProviderYear${year}">0</td>
                <td id="roomsNeededProvider${year}">0</td>
                <td id="providersNeeded${year}">0</td>
                <td id="roomsNeeded${year}">0</td>
            `;
            tbody.appendChild(tr);
        }
    };
    
    window.addOutputRowProviderProductivityPeak = window.addOutputRowProviderProductivityPeak || function(year) {
        const tbody = document.getElementById("outputTbody4");
        if (tbody) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${year}</td>
                <td id="visitsProviderYearPeak${year}">0</td>
                <td id="roomsNeededProviderPeak${year}">0</td>
                <td id="providersNeededPeak${year}">0</td>
                <td id="roomsNeededPeak${year}">0</td>
            `;
            tbody.appendChild(tr);
        }
    };
    
    // Funciones de eliminación (simplificadas)
    window.removeOutputRow = window.removeOutputRow || function(year) {
        const rows = document.querySelectorAll('#outputTbody tr');
        rows.forEach(row => {
            if (row.querySelector('.yearCell')?.textContent == year) {
                row.remove();
            }
        });
    };
    
    window.removeOutputRowPeak = window.removeOutputRowPeak || function(year) {
        const rows = document.querySelectorAll('#outputTbody2 tr');
        rows.forEach(row => {
            if (row.querySelector('.yearCell')?.textContent == year) {
                row.remove();
            }
        });
    };
    
    window.removeOutputRowProviderProductivity = window.removeOutputRowProviderProductivity || function(year) {
        const rows = document.querySelectorAll('#outputTbody3 tr');
        rows.forEach(row => {
            if (row.firstElementChild?.textContent == year) {
                row.remove();
            }
        });
    };
    
    window.removeOutputRowProviderProductivityPeak = window.removeOutputRowProviderProductivityPeak || function(year) {
        const rows = document.querySelectorAll('#outputTbody4 tr');
        rows.forEach(row => {
            if (row.firstElementChild?.textContent == year) {
                row.remove();
            }
        });
    };
    
    // ============== INICIALIZACIÓN ==============
    // Cargar librerías y configurar interfaz
    loadSheetJS()
        .then(() => {
            console.log("Funcionalidad de importación Excel lista");
            
            // Crear interfaz de importación
            const { importButton, fileInput } = createImportInterface();
            
            // Configurar eventos
            setupEventListeners(importButton, fileInput);
            
        })
        .catch(error => {
            console.error("Error al cargar la biblioteca SheetJS:", error);
            showMessage("Error al cargar las librerías necesarias", "error");
        });
    
    // ============== API PÚBLICA PARA PERSONALIZACIÓN ==============
    // Exponer funciones para personalizar estilos desde fuera
    window.ExcelImporter = {
        updateStyles: function(newStyles) {
            Object.assign(CSS_STYLES, newStyles);
        },
        
        getStyles: function() {
            return CSS_STYLES;
        },
        
        showCustomMessage: function(text, type = "success") {
            showMessage(text, type);
        }
    };
});