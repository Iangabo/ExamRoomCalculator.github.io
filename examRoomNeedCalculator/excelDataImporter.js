// excelDataImporter.js 
document.addEventListener("DOMContentLoaded", function() {
    // Declare global variable if it does not exist
    window.roomUtilizationTarget = window.roomUtilizationTarget || 75; 
    
    // Create getPrecalculatedData function if it does not exist
    window.getPrecalculatedData = window.getPrecalculatedData || function() {
        // Default implementation that collects data from the UI
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
    
    // Add Excel import button to the UI
    const controlsContainer = document.querySelector(".controls-container") || document.body;
    const importButton = document.createElement("button");
    importButton.id = "importExcelBtn";
    importButton.className = "import-btn";
    importButton.innerHTML = '<i class="fas fa-file-excel"></i> Import Excel data';
    importButton.style.backgroundColor = "#4CAF50";
    importButton.style.color = "white";
    importButton.style.padding = "10px 15px";
    importButton.style.border = "none";
    importButton.style.borderRadius = "4px";
    importButton.style.cursor = "pointer";
    importButton.style.marginTop = "50px";
    
    controlsContainer.appendChild(importButton);
    
    // Create file input field (hidden)
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "excelFileInput";
    fileInput.accept = ".xlsx, .xls";
    fileInput.style.display = "none";
    
    controlsContainer.appendChild(fileInput);
    
    // Manage import button click
    importButton.addEventListener("click", function() {
        fileInput.click();
    });
    
    // Handle change in file input field
    fileInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            processExcelFile(data);
        };
        reader.readAsArrayBuffer(file);
    });
    
    // Process Excel file using SheetJS
    function processExcelFile(data) {
        try {
            // Analyze the Excel file
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Search for parameter sheet (first sheet or with specific name)
            let parametersSheet;
            if (workbook.SheetNames.includes("Parameters")) {
                parametersSheet = "Parameters";
            } else {
                parametersSheet = workbook.SheetNames[0];
            }
            
            const worksheet = workbook.Sheets[parametersSheet];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                alert("No data were found in the Excel file.");
                return;
            }
            
            console.log("Data extracted:", jsonData);
            
            // Extract data and update entries and calculations
            extractParametersAndUpdateUI(jsonData, workbook);
            
        } catch (error) {
            console.error("Error processing Excel file:", error);
            alert("Error processing Excel file. Check formatting and try again.");
        }
    }
    
    // Extract data from Excel and update UI elements
    function extractParametersAndUpdateUI(jsonData, workbook) {
        // Mapping expected column names in Excel to input IDs
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
            "Room Utilization Target (%)": "room-utilization-target" // Custom field for ring chart
        };
        
        // Search for parameters in key-value pair format
        for (const row of jsonData) {
            if (row.Parameter && row.Value !== undefined) {
                const paramName = row.Parameter;
                const paramValue = row.Value;
                
                const inputId = mappings[paramName];
                if (inputId) {
                    const inputElement = document.getElementById(inputId);
                    if (inputElement) {
                        inputElement.value = paramValue;
                        // Trigger input event to update calculations
                        const event = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(event);
                    }
                    
                    // Special case for target room utilization
                    if (paramName === "Room Utilization Target (%)") {
                        window.roomUtilizationTarget = paramValue;
                    }
                }
                
                // Find visit time breakdown data for the pie chart
                if (paramName === "MA Visit Time" || paramName === "Wait Time" || paramName === "Provider Visit Time") {
                    handleVisitTimeData(paramName, paramValue);
                }
            }
        }
        
        // Extract year-specific data (from other sheets)
        try {
            // Attempt to load the “Results” sheet if it exists.
            if (workbook.SheetNames.includes("Results")) {
                const resultsSheet = workbook.Sheets["Results"];
                const resultsData = XLSX.utils.sheet_to_json(resultsSheet);
                
                if (resultsData.length > 0) {
                    processYearData(resultsData);
                }
            }
            
            // Attempt to load the “Peak Results” sheet if it exists.
            if (workbook.SheetNames.includes("Peak Results")) {
                const peakSheet = workbook.Sheets["Peak Results"];
                const peakData = XLSX.utils.sheet_to_json(peakSheet);
                
                if (peakData.length > 0) {
                    processPeakData(peakData);
                }
            }
        } catch (error) {
            console.error("Error when processing result sheets:", error);
        }
        
        // Trigger calculations and chart updates
        if (typeof window.calculateDataForSelectedYears === "function") {
            window.calculateDataForSelectedYears();
        }
        
        if (typeof window.updateChart === "function") {
            window.updateChart(getPrecalculatedData());
        }
        
        // Update ring chart if it exists
        if (typeof window.updateDonnutChart === "function") {
            window.updateDonnutChart();
        }
        
        // Show success message
        showImportSuccess();
    }
    
    // Manage visit time data
    function handleVisitTimeData(paramName, paramValue) {
        if (!window.breakdownValues) {
            window.breakdownValues = [12.5, 13, 19.5]; // Default values [MA, Wait, Provider].
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
        
        // Update pie chart if function exists
        if (typeof window.updatePieChart === "function") {
            window.updatePieChart();
        }
    }
    
    // Process average year data
    function processYearData(resultsData) {
        const yearData = [];
        
        //  Search rows with year information
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
            
            // Maintain values in table if possible
            yearData.forEach(data => {
                updateTableCellsIfExists("visits", data.year, data.visits);
                updateTableCellsIfExists("rooms", data.year, data.rooms);  
                updateTableCellsIfExists("providers", data.year, data.providers);
                updateTableCellsIfExists("productivity", data.year, data.productivity);
            });
        }
    }
    
    // Process peak month data
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
    
    // Update table cells if they exist
    function updateTableCellsIfExists(prefix, year, value) {
        if (value === null || value === undefined) return;
        
        const cellId = prefix + year;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.textContent = value;
        }
    }
    
    // Select years based on imported data
    function selectYearsFromData(yearData) {
        // Check required functions
        const hasAddOutputRow = typeof window.addOutputRow === 'function';
        const hasAddOutputRowPeak = typeof window.addOutputRowPeak === 'function';
        const hasAddOutputRowProviderProductivity = typeof window.addOutputRowProviderProductivity === 'function';
        const hasAddOutputRowProviderProductivityPeak = typeof window.addOutputRowProviderProductivityPeak === 'function';
        
        const hasRemoveOutputRow = typeof window.removeOutputRow === 'function';
        const hasRemoveOutputRowPeak = typeof window.removeOutputRowPeak === 'function';
        const hasRemoveOutputRowProviderProductivity = typeof window.removeOutputRowProviderProductivity === 'function';
        const hasRemoveOutputRowProviderProductivityPeak = typeof window.removeOutputRowProviderProductivityPeak === 'function';
        
        // Clear previously selected years
        document.querySelectorAll(".year-button.active").forEach(btn => {
            btn.classList.remove("active");
            const year = parseInt(btn.dataset.year, 10);
            
            if (hasRemoveOutputRow) window.removeOutputRow(year);
            if (hasRemoveOutputRowPeak) window.removeOutputRowPeak(year);
            if (hasRemoveOutputRowProviderProductivity) window.removeOutputRowProviderProductivity(year);
            if (hasRemoveOutputRowProviderProductivityPeak) window.removeOutputRowProviderProductivityPeak(year);
        });
        
        // Select years of data
        yearData.forEach(data => {
            const yearBtn = document.querySelector(`.year-button[data-year="${data.year}"]`);
            if (yearBtn) {
                yearBtn.classList.add("active");
                
                if (hasAddOutputRow) window.addOutputRow(data.year);
                if (hasAddOutputRowPeak) window.addOutputRowPeak(data.year);
                if (hasAddOutputRowProviderProductivity) window.addOutputRowProviderProductivity(data.year);
                if (hasAddOutputRowProviderProductivityPeak) window.addOutputRowProviderProductivityPeak(data.year);
            }
        });
    }
    
    // Show success message
    function showImportSuccess() {
        const successMsg = document.createElement("div");
        successMsg.className = "import-success";
        successMsg.innerHTML = "¡Datos Excel importados correctamente!";
        successMsg.style.backgroundColor = "#4CAF50";
        successMsg.style.color = "white";
        successMsg.style.padding = "10px";
        successMsg.style.borderRadius = "4px";
        successMsg.style.position = "fixed";
        successMsg.style.top = "20px";
        successMsg.style.right = "20px";
        successMsg.style.zIndex = "1000";
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.opacity = "0";
            successMsg.style.transition = "opacity 0.5s";
            setTimeout(() => successMsg.remove(), 500);
        }, 3000);
    }
    
    // Check if we need to load the SheetJS library
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
    
    // Load required libraries
    loadSheetJS()
        .then(() => {
            console.log("Funcionalidad de importación Excel lista");
        })
        .catch(error => {
            console.error("Error al cargar la biblioteca SheetJS:", error);
        });
    
    // To expose functions that may be needed
    window.addOutputRow = window.addOutputRow || function(year) {
        console.log(`Función addOutputRow no definida, intentando añadir fila para ${year}`);
        // Basic implementation if nonexistent
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
    
    window.removeOutputRow = window.removeOutputRow || function(year) {
        const row = document.querySelector(`#outputTbody tr td:first-child:contains('${year}')`).parentNode;
        if (row) row.remove();
    };
    
    window.removeOutputRowPeak = window.removeOutputRowPeak || function(year) {
        const row = document.querySelector(`#outputTbody2 tr td:first-child:contains('${year}')`).parentNode;
        if (row) row.remove();
    };
    
    window.removeOutputRowProviderProductivity = window.removeOutputRowProviderProductivity || function(year) {
        const row = document.querySelector(`#outputTbody3 tr td:first-child:contains('${year}')`).parentNode;
        if (row) row.remove();
    };
    
    window.removeOutputRowProviderProductivityPeak = window.removeOutputRowProviderProductivityPeak || function(year) {
        const row = document.querySelector(`#outputTbody4 tr td:first-child:contains('${year}')`).parentNode;
        if (row) row.remove();
    };
});