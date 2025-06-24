let roomUtilizationTarget = 26;

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById("transition-overlay").classList.add("slide-out");
        setTimeout(function () {
            document.getElementById("transition-overlay").remove();
        }, 600);
    }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
    // Input elements
    const inputs = document.querySelectorAll("input");
    // Parameters
    const annualGrowthTargetInput = document.getElementById("annual-growth-target");
    const avgClinicVisitTimeInput = document.getElementById("avg-clinic-visit-time");
    const availableDaysPerYearInput = document.getElementById("clinic-operation-days-per-year");
    const clinicOperationHoursPerDayInput = document.getElementById("clinic-operation-hours-per-day");
    const currentExamRoomsPerProviderInput = document.getElementById("current-exam-rooms-per-provider");
    const patientVisitsInput = document.getElementById("patient-visits");
    const peakMonthVolumeInput = document.getElementById("peak-month-volume");
    const providerProductivityCurrentInput = document.getElementById("provider-productivity-current");
    const providerProductivityTargetInput = document.getElementById("provider-productivity-target");

    // output containers (tbody)
    const outputTbody = document.getElementById("outputTbody");
    const outputTbody2 = document.getElementById("outputTbody2");
    const outputTbody3 = document.getElementById("outputTbody3");
    const outputTbody4 = document.getElementById("outputTbody4");

    // year selector 
    const startYear = 2024; // const startYear = new Date().getFullYear();
    const endYear = 2034;
    const yearSelector = document.getElementById("yearSelector");

    // create year buttons
    for (let year = startYear; year <= endYear; year++) {
        const btn = document.createElement("button");
        btn.classList.add("year-button");
        btn.dataset.year = year;
        btn.textContent = year;

        btn.addEventListener("click", function () {
            const activeButtons = document.querySelectorAll(".year-button.active");

            if (!this.classList.contains("active") && activeButtons.length >= 11) {
                return;
            }

            // Toggle active state on click
            this.classList.toggle("active");

            if (this.classList.contains("active")) {
                addOutputRow(year);
                addOutputRowPeak(year);
                addOutputRowProviderProductivity(year);
                addOutputRowProviderProductivityPeak(year);
            } else {
                removeOutputRow(year);
                removeOutputRowPeak(year);
                removeOutputRowProviderProductivity(year);
                removeOutputRowProviderProductivityPeak(year);
            }

            calculateDataForSelectedYears();

            // Update the chart (defined in chart.js)
            if (typeof updateChart === "function") {
                updateChart(getPrecalculatedData());
            }
        });

        yearSelector.appendChild(btn);
    }

    // arrow buttons for scrolling year selector
    // const leftArrow = document.querySelector(".arrow.left");
    // const rightArrow = document.querySelector(".arrow.right");
    // leftArrow.addEventListener("click", function () {
    //     yearSelector.scrollBy({ left: -100, behavior: "smooth" });
    // });
    // rightArrow.addEventListener("click", function () {
    //     yearSelector.scrollBy({ left: 100, behavior: "smooth" });
    // });

    // Add output row for a given year in chronological order
    // Modificar la función addOutputRow para incluir animación
    function addOutputRow(year) {
        if (document.getElementById(`outputRow_${year}`)) return;
        
        const row = document.createElement("tr");
        row.id = `outputRow_${year}`;
        row.className = "new-row"; 
        row.innerHTML = `
            <td class="yearCell">${year}</td>
            <td class="visitsCell animated-cell" id="visits${year}"></td>
            <td class="roomsCell animated-cell" id="rooms${year}"></td>
            <td class="providersCell animated-cell" id="providers${year}"></td>
            <td class="productivityCell animated-cell" id="productivity${year}"></td>
        `;
        
        // Get all existing rows
        const existingRows = Array.from(outputTbody.querySelectorAll("tr"));
        
        // If no rows or this year is greater than all existing years, just append
        if (existingRows.length === 0) {
            outputTbody.appendChild(row);
            return;
        }
        
        // Find the correct position to insert based on year
        let inserted = false;
        for (let i = 0; i < existingRows.length; i++) {
            const existingYear = parseInt(existingRows[i].querySelector(".yearCell").textContent);
            if (year < existingYear) {
                outputTbody.insertBefore(row, existingRows[i]);
                inserted = true;
                break;
            }
        }
        
        // If not inserted (this year is greater than all existing years), append at the end
        if (!inserted) {
            outputTbody.appendChild(row);
        }
    }

    // Add output row for peak month volume in chronological order
    function addOutputRowPeak(year) {
        if (document.getElementById(`outputRowPeak_${year}`)) return;
        
        const row = document.createElement("tr");
        row.id = `outputRowPeak_${year}`;
        row.className = "new-row";
        row.innerHTML = `
            <td class="yearCell">${year}</td>
            <td class="visitsCell" id="visitsPeak${year}"></td>
            <td class="roomsCell" id="roomsPeak${year}"></td>
            <td class="providersCell" id="providersPeak${year}"></td>
            <td class="productivityCell" id="productivityPeak${year}"></td>
        `;
        
        // Get all existing rows
        const existingRows = Array.from(outputTbody2.querySelectorAll("tr"));
        
        // If no rows or this year is greater than all existing years, just append
        if (existingRows.length === 0) {
            outputTbody2.appendChild(row);
            return;
        }
        
        // Find the correct position to insert based on year
        let inserted = false;
        for (let i = 0; i < existingRows.length; i++) {
            const existingYear = parseInt(existingRows[i].querySelector(".yearCell").textContent);
            if (year < existingYear) {
                outputTbody2.insertBefore(row, existingRows[i]);
                inserted = true;
                break;
            }
        }
        
        // If not inserted (this year is greater than all existing years), append at the end
        if (!inserted) {
            outputTbody2.appendChild(row);
        }
    }

    // Add output row for provider productivity in chronological order
    function addOutputRowProviderProductivity(year) {
        if (document.getElementById(`outputRowProvProd_${year}`)) return;
        
        const row = document.createElement("tr");
        row.id = `outputRowProvProd_${year}`;
        row.className = "new-row";
        row.innerHTML = `
            <td class="yearCell">${year}</td>
            <td class="visitsProviderYearCell" id="visitsProviderYear${year}"></td>
            <td class="roomsNeededProviderCell" id="roomsNeededProvider${year}"></td>
            <td class="providersNeededCell" id="providersNeeded${year}"></td>
            <td class="roomsNeededCell" id="roomsNeeded${year}"></td>
        `;
        
        // Get all existing rows
        const existingRows = Array.from(outputTbody3.querySelectorAll("tr"));
        
        // If no rows or this year is greater than all existing years, just append
        if (existingRows.length === 0) {
            outputTbody3.appendChild(row);
            return;
        }
        
        // Find the correct position to insert based on year
        let inserted = false;
        for (let i = 0; i < existingRows.length; i++) {
            const existingYear = parseInt(existingRows[i].querySelector(".yearCell").textContent);
            if (year < existingYear) {
                outputTbody3.insertBefore(row, existingRows[i]);
                inserted = true;
                break;
            }
        }
        
        // If not inserted (this year is greater than all existing years), append at the end
        if (!inserted) {
            outputTbody3.appendChild(row);
        }
    }

    // Add output row for provider productivity peak in chronological order
    function addOutputRowProviderProductivityPeak(year) {
        if (document.getElementById(`outputRowProvProdPeak_${year}`)) return;
        
        const row = document.createElement("tr");
        row.id = `outputRowProvProdPeak_${year}`;
        row.className = "new-row";
        row.innerHTML = `
            <td class="yearCell">${year}</td>
            <td class="visitsProviderYearCell" id="visitsProviderYearPeak${year}"></td>
            <td class="roomsNeededProviderCell" id="roomsNeededProviderPeak${year}"></td>
            <td class="providersNeededCell" id="providersNeededPeak${year}"></td>
            <td class="roomsNeededCell" id="roomsNeededPeak${year}"></td>
        `;
        
        // Get all existing rows
        const existingRows = Array.from(outputTbody4.querySelectorAll("tr"));
        
        // If no rows or this year is greater than all existing years, just append
        if (existingRows.length === 0) {
            outputTbody4.appendChild(row);
            return;
        }
        
        // Find the correct position to insert based on year
        let inserted = false;
        for (let i = 0; i < existingRows.length; i++) {
            const existingYear = parseInt(existingRows[i].querySelector(".yearCell").textContent);
            if (year < existingYear) {
                outputTbody4.insertBefore(row, existingRows[i]);
                inserted = true;
                break;
            }
        }
        
        // If not inserted (this year is greater than all existing years), append at the end
        if (!inserted) {
            outputTbody4.appendChild(row);
        }
    }

    // Remove output rows
    function removeOutputRow(year) {
        const row = document.getElementById(`outputRow_${year}`);
        if (row) {
            row.remove();
        }
    }

    function removeOutputRowPeak(year) {
        const row = document.getElementById(`outputRowPeak_${year}`);
        if (row) {
            row.remove();
        }
    }

    function removeOutputRowProviderProductivity(year) {
        const row = document.getElementById(`outputRowProvProd_${year}`);
        if (row) {
            row.remove();
        }
    }

    function removeOutputRowProviderProductivityPeak(year) {
        const row = document.getElementById(`outputRowProvProdPeak_${year}`);
        if (row) {
            row.remove();
        }
    }

    // calculate data for a given target year (AVERAGE VOLUME)
    function calculateDataForYear(selectedYear) {
        const annualGrowthTarget = parseFloat(annualGrowthTargetInput.value);
        const avgClinicVisitTime = parseFloat(avgClinicVisitTimeInput.value);
        const availableDaysPerYear = parseFloat(availableDaysPerYearInput.value);
        const clinicOperationHoursPerDay = parseFloat(clinicOperationHoursPerDayInput.value);
        const providerProductivityTarget = parseFloat(providerProductivityTargetInput.value);
        const patientVisits = parseFloat(patientVisitsInput.value);

        const yearsFromBaseline = selectedYear - startYear;
        const projectedVisits = patientVisits * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);
        const providerProductivityPerDay = providerProductivityTarget * clinicOperationHoursPerDay;
        const avgDailyVisits = projectedVisits / availableDaysPerYear;
        const requiredProviders = avgDailyVisits / providerProductivityPerDay;
        const requiredProvidersRounded = (requiredProviders % 1 > 0.1)
            ? Math.ceil(requiredProviders)
            : Math.round(requiredProviders);

        const examRoomOccupancy = ((roomUtilizationTarget / 100) * clinicOperationHoursPerDay * 60) / avgClinicVisitTime;
        const examRoomOccupancyRounded = Math.floor(examRoomOccupancy);
        const departmentProductivityTarget = providerProductivityPerDay * requiredProvidersRounded;
        const requiredExamRooms = Math.ceil(departmentProductivityTarget / examRoomOccupancyRounded);
        let providerProductivityPerHour = 0;
        if (clinicOperationHoursPerDay > 0 && requiredProvidersRounded > 0) {
            providerProductivityPerHour = avgDailyVisits / (clinicOperationHoursPerDay * requiredProvidersRounded);
        }
        return {
            year: selectedYear,
            visits: Math.round(projectedVisits),
            rooms: requiredExamRooms,
            providers: requiredProvidersRounded,
            productivity: providerProductivityPerHour.toFixed(2)
        };
    }

    // calculate data for a given target year (PEAK MONTH VOLUME)
    function calculateDataForYearPeak(selectedYear) {
        const annualGrowthTarget = parseFloat(annualGrowthTargetInput.value);
        const avgClinicVisitTime = parseFloat(avgClinicVisitTimeInput.value);
        const availableDaysPerYear = parseFloat(availableDaysPerYearInput.value);
        const clinicOperationHoursPerDay = parseFloat(clinicOperationHoursPerDayInput.value);
        const providerProductivityTarget = parseFloat(providerProductivityTargetInput.value);
        const peakMonthVolume = parseFloat(peakMonthVolumeInput.value);

        const availableDaysPerMonth = availableDaysPerYear / 12;

        const yearsFromBaseline = selectedYear - startYear;
        // Projection of peak month volume with annual growth
        const projectedPeakMonthVisits = peakMonthVolume * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);
        // Annualize the peak month volume to show in the table
        const annualizedPeakVisits = projectedPeakMonthVisits * 12;

        const providerProductivityPerDay = providerProductivityTarget * clinicOperationHoursPerDay;
        // Calculate average daily visits during peak month
        const peakDailyVisits = projectedPeakMonthVisits / availableDaysPerMonth;

        const requiredProviders = peakDailyVisits / providerProductivityPerDay;
        const requiredProvidersRounded = (requiredProviders % 1 > 0.1)
            ? Math.ceil(requiredProviders)
            : Math.round(requiredProviders);

        const examRoomOccupancy = ((roomUtilizationTarget / 100) * clinicOperationHoursPerDay * 60) / avgClinicVisitTime;
        const examRoomOccupancyRounded = Math.floor(examRoomOccupancy);
        const departmentProductivityTarget = providerProductivityPerDay * requiredProvidersRounded;
        const requiredExamRooms = Math.ceil(departmentProductivityTarget / examRoomOccupancyRounded);

        let providerProductivityPerHour = 0;
        if (clinicOperationHoursPerDay > 0 && requiredProvidersRounded > 0) {
            providerProductivityPerHour = peakDailyVisits / (clinicOperationHoursPerDay * requiredProvidersRounded);
        }

        return {
            year: selectedYear,
            visits: Math.round(annualizedPeakVisits),
            rooms: requiredExamRooms,
            providers: requiredProvidersRounded,
            productivity: providerProductivityPerHour.toFixed(2)
        };
    }

    // Calculate data for provider productivity target (Average Volume)
    function calculateProviderProductivityData(selectedYear) {
        const annualGrowthTarget = parseFloat(annualGrowthTargetInput.value);
        const avgClinicVisitTime = parseFloat(avgClinicVisitTimeInput.value);
        const availableDaysPerYear = parseFloat(availableDaysPerYearInput.value);
        const clinicOperationHoursPerDay = parseFloat(clinicOperationHoursPerDayInput.value);
        const patientVisits = parseFloat(patientVisitsInput.value);
        const providerProductivityTarget = parseFloat(providerProductivityTargetInput.value);
    
        // Calculate projected visits based on annual growth
        const yearsFromBaseline = selectedYear - startYear;
        const projectedVisits = patientVisits * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);    
    
        // Base value (without growth) for calculations
        const baseVisitsProviderYear = providerProductivityTarget * clinicOperationHoursPerDay * availableDaysPerYear;
        
        // Value with growth to show in the table
        const visitsProviderYear = baseVisitsProviderYear * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);
    
        // Calculate rooms needed per provider
        // Using the formula: (visit time * provider productivity) / (60 minutes * room utilization)
        const roomsNeededProvider = (avgClinicVisitTime * providerProductivityTarget) / (60 * (roomUtilizationTarget / 100));
        const roomsNeededProviderRounded = Math.ceil(roomsNeededProvider);
    
        // Calculate providers needed
        const providersNeeded = projectedVisits / baseVisitsProviderYear;
        const providersNeededRounded = Math.ceil(providersNeeded);
    
        // Calculate total rooms needed
        const roomsNeeded = providersNeededRounded * roomsNeededProviderRounded;
    
        return {
            year: selectedYear,
            visitsProviderYear: Math.round(visitsProviderYear),
            roomsNeededProvider: roomsNeededProviderRounded,
            providersNeeded: providersNeededRounded,
            roomsNeeded: roomsNeeded
        };
    }

    // Calculate data for provider productivity target (Peak Month Volume)
    function calculateProviderProductivityDataPeak(selectedYear) {
        const annualGrowthTarget = parseFloat(annualGrowthTargetInput.value);
        const avgClinicVisitTime = parseFloat(avgClinicVisitTimeInput.value);
        const availableDaysPerYear = parseFloat(availableDaysPerYearInput.value);
        const clinicOperationHoursPerDay = parseFloat(clinicOperationHoursPerDayInput.value);
        const peakMonthVolume = parseFloat(peakMonthVolumeInput.value);
        const providerProductivityTarget = parseFloat(providerProductivityTargetInput.value);

        // Calculate projected peak month visits based on annual growth
        const yearsFromBaseline = selectedYear - startYear;
        const projectedPeakMonthVisits = peakMonthVolume * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);
        const annualizedPeakVisits = projectedPeakMonthVisits * 12;

       // Base value (without growth) for calculations
       const baseVisitsProviderYear = providerProductivityTarget * clinicOperationHoursPerDay * availableDaysPerYear;
        
       // Value with growth to show in the table
       const visitsProviderYear = baseVisitsProviderYear * Math.pow(1 + annualGrowthTarget, yearsFromBaseline);

        // Calculate rooms needed per provider
        const roomsNeededProvider = (avgClinicVisitTime * providerProductivityTarget) / (60 * (roomUtilizationTarget / 100));
        const roomsNeededProviderRounded = Math.ceil(roomsNeededProvider);

        // Calculate providers needed based on peak volume
        const providersNeeded = annualizedPeakVisits / baseVisitsProviderYear;
        const providersNeededRounded = Math.ceil(providersNeeded);

        // Calculate total rooms needed
        const roomsNeeded = providersNeededRounded * roomsNeededProviderRounded;

        return {
            year: selectedYear,
            visitsProviderYear: Math.round(visitsProviderYear),
            roomsNeededProvider: roomsNeededProviderRounded,
            providersNeeded: providersNeededRounded,
            roomsNeeded: roomsNeeded
        };
    }

    // update output for all selected years
    function calculateDataForSelectedYears() {
        const activeYearButtons = document.querySelectorAll(".year-button.active");
        activeYearButtons.forEach(btn => {
            const year = parseInt(btn.dataset.year, 10);
            
            // Calculate data for room utilization tables
            const result = calculateDataForYear(year);
            const resultPeak = calculateDataForYearPeak(year);
            updateOutputRow(result);
            updateOutputRowPeak(resultPeak);
            
            // Calculate data for provider productivity tables
            const providerProductivityResult = calculateProviderProductivityData(year);
            const providerProductivityResultPeak = calculateProviderProductivityDataPeak(year);
            updateOutputRowProviderProductivity(providerProductivityResult);
            updateOutputRowProviderProductivityPeak(providerProductivityResultPeak);
        });
    }

    window.getPrecalculatedData = function () {
        const activeYearButtons = document.querySelectorAll(".year-button.active");
        return Array.from(activeYearButtons).map(btn => {
            const year = parseInt(btn.dataset.year, 10);
            return calculateDataForYear(year);
        });
    }

    const toggleAllYearsCheckbox = document.getElementById("toggleAllYearsCheckbox");

    toggleAllYearsCheckbox.addEventListener("change", function () {
        const yearButtons = document.querySelectorAll(".year-button");
    
        if (this.checked) {
            // Activar todos los botones
            yearButtons.forEach(btn => {
                const year = parseInt(btn.dataset.year, 10);
                btn.classList.add("active");
                btn.disabled = true;
                
                // Agregar filas para este año en todas las tablas
                addOutputRow(year);
                addOutputRowPeak(year);
                addOutputRowProviderProductivity(year);
                addOutputRowProviderProductivityPeak(year);
            });
            
            // Calcular datos para todos los años seleccionados
            calculateDataForSelectedYears();
    
            if (typeof updateChart === "function") {
                updateChart(getPrecalculatedData());
            }
        } else {

            yearButtons.forEach(btn => {
                const year = parseInt(btn.dataset.year, 10);
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                    btn.disabled = false;
                    removeOutputRow(year);
                    removeOutputRowPeak(year);
                    removeOutputRowProviderProductivity(year);
                    removeOutputRowProviderProductivityPeak(year);
                }
            });

            calculateDataForSelectedYears();
    
            if (typeof updateChart === "function") {
                updateChart(getPrecalculatedData());
            }
        }
    });

    window.calculateDataForSelectedYears = calculateDataForSelectedYears;

    // update specific output row for a given year's result (AVERAGE VOLUME)
    function updateOutputRow({ year, visits, rooms, providers, productivity }) {
        const visitsCell = document.getElementById(`visits${year}`);
        const roomsCell = document.getElementById(`rooms${year}`);
        const providersCell = document.getElementById(`providers${year}`);
        const productivityCell = document.getElementById(`productivity${year}`);
        if (visitsCell) visitsCell.textContent = visits;
        if (roomsCell) roomsCell.textContent = rooms;
        if (providersCell) providersCell.textContent = providers;
        if (productivityCell) productivityCell.textContent = productivity;
    }

    // update specific output row for a given year's result (PEAK MONTH VOLUME)
    function updateOutputRowPeak({ year, visits, rooms, providers, productivity }) {
        const visitsCell = document.getElementById(`visitsPeak${year}`);
        const roomsCell = document.getElementById(`roomsPeak${year}`);
        const providersCell = document.getElementById(`providersPeak${year}`);
        const productivityCell = document.getElementById(`productivityPeak${year}`);
        if (visitsCell) visitsCell.textContent = visits;
        if (roomsCell) roomsCell.textContent = rooms;
        if (providersCell) providersCell.textContent = providers;
        if (productivityCell) productivityCell.textContent = productivity;
    }

    // Update output row for provider productivity target (Average Volume)
    function updateOutputRowProviderProductivity({ year, visitsProviderYear, roomsNeededProvider, providersNeeded, roomsNeeded }) {
        const visitsProviderYearCell = document.getElementById(`visitsProviderYear${year}`);
        const roomsNeededProviderCell = document.getElementById(`roomsNeededProvider${year}`);
        const providersNeededCell = document.getElementById(`providersNeeded${year}`);
        const roomsNeededCell = document.getElementById(`roomsNeeded${year}`);
        
        if (visitsProviderYearCell) visitsProviderYearCell.textContent = visitsProviderYear;
        if (roomsNeededProviderCell) roomsNeededProviderCell.textContent = roomsNeededProvider;
        if (providersNeededCell) providersNeededCell.textContent = providersNeeded;
        if (roomsNeededCell) roomsNeededCell.textContent = roomsNeeded;
    }

    // Update output row for provider productivity target (Peak Month Volume)
    function updateOutputRowProviderProductivityPeak({ year, visitsProviderYear, roomsNeededProvider, providersNeeded, roomsNeeded }) {
        const visitsProviderYearCell = document.getElementById(`visitsProviderYearPeak${year}`);
        const roomsNeededProviderCell = document.getElementById(`roomsNeededProviderPeak${year}`);
        const providersNeededCell = document.getElementById(`providersNeededPeak${year}`);
        const roomsNeededCell = document.getElementById(`roomsNeededPeak${year}`);
        
        if (visitsProviderYearCell) visitsProviderYearCell.textContent = visitsProviderYear;
        if (roomsNeededProviderCell) roomsNeededProviderCell.textContent = roomsNeededProvider;
        if (providersNeededCell) providersNeededCell.textContent = providersNeeded;
        if (roomsNeededCell) roomsNeededCell.textContent = roomsNeeded;
    }

    // when any input changes update all selected years
    inputs.forEach(input => {
        input.addEventListener("input", function () {
            calculateDataForSelectedYears();
            if (typeof updateChart === "function") {
                updateChart(getPrecalculatedData());
            }
        });
    });

    // Initial calculation on load
    calculateDataForSelectedYears();
});
