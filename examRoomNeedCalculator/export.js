function addExportButton() {
  // Create the export button
  const exportButton = document.createElement('button');
  exportButton.id = 'exportToExcel';
  exportButton.className = 'export-button';
  exportButton.innerHTML = '<i class="export-icon"></i>Export to Excel';

  // Create a container for the button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'export-button-container';

  // Add the button to the container
  buttonContainer.appendChild(exportButton);

  // Find a better insertion point - insert after the last year-selector-container
  const yearSelectors = document.getElementById('yearSelectors')
  // const yearSelectors = document.querySelectorAll('.year-selector-container');
  const lastYearSelector = yearSelectors[yearSelectors.length - 1];

  // Insert after the year selector container parent (to avoid nesting issues)
  if (lastYearSelector && lastYearSelector.parentNode) {
    lastYearSelector.parentNode.after(buttonContainer);
  } else {
    // Fallback insertion
    document.getElementById('action-buttons').appendChild(buttonContainer);
  }

  // Add the event listener for the export
  exportButton.addEventListener('click', exportTableDataToExcel);

  // Create notification container
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  document.body.appendChild(notificationContainer);

  // Add CSS styles for the button and notifications
  const style = document.createElement('style');
  style.textContent = `
      .export-button-container {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin: 10px 0;
          padding: 0 20px;
          position: relative;
          z-index: 100;
      }
      
      .export-button {
          background: linear-gradient(to bottom, #088eb0, #088eb0);
          color: white;
          padding: 12px 22px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 101;
      }
      
      .export-button:hover {
          background: linear-gradient(to bottom, rgb(52, 131, 151), rgb(52, 131, 151));
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0,0,0,0.2);
      }
      
      .export-button:active {
          transform: translateY(1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      }
      
      .export-icon {
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFFFFF'%3E%3Cpath d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
      }
      
      /* New notification styling */
      #notification-container {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
      }
      
      .notification {
          min-width: 250px;
          max-width: 350px;
          padding: 15px 20px;
          border-radius: 6px;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          transform: translateX(-120%);
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          opacity: 0.95;
      }
      
      .notification.show {
          transform: translateX(0);
      }
      
      .notification::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-right: 12px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
      }
      
      .notification.success {
          background-color: #088eb0;
      }
      
      .notification.success::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFFFFF'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
      }
      
      .notification.error {
          background-color: #F44336;
      }
      
      .notification.error::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFFFFF'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E");
      }
      
      .notification.info {
          background-color: #4CAF50;
      }
      
      .notification.info::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFFFFF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
      }
  `;
  document.head.appendChild(style);
}

// Function to export table data to Excel
function exportTableDataToExcel() {
  // Show loading message
  showExportMessage('Generating Excel...', 'info');

  // Add SheetJS library if it doesn't exist
  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = function () {
      performExport();
    };
    document.head.appendChild(script);
  } else {
    performExport();
  }
}

function performExport() {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create Room Utilization sheet with both Average and Peak tables
    const roomUtilizationData = getRoomUtilizationData();
    const roomUtilizationSheet = XLSX.utils.aoa_to_sheet(roomUtilizationData);

    // Create Provider Productivity sheet with both Average and Peak tables
    const providerProductivityData = getProviderProductivityData();
    const providerProductivitySheet = XLSX.utils.aoa_to_sheet(providerProductivityData);

    // Add summary sheet with input parameters
    const summaryData = getSummaryData();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Apply styles to sheets
    applyStyles(roomUtilizationSheet, roomUtilizationData);
    applyStyles(providerProductivitySheet, providerProductivityData);
    applyStyles(summarySheet, summaryData);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, roomUtilizationSheet, "Room Utilization");
    XLSX.utils.book_append_sheet(wb, providerProductivitySheet, "Provider Productivity");
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Get the current date for the filename
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Write the workbook and trigger download
    XLSX.writeFile(wb, `Planning_Units_${dateStr}.xlsx`);

    // Show success message
    showExportMessage('Export successful!', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    showExportMessage('Export failed. Please try again.', 'error');
  }
}

// Function to apply styles to Excel sheets
function applyStyles(worksheet, data) {
  // Create a styles object
  if (!worksheet['!cols']) worksheet['!cols'] = [];

  // Set column widths
  for (let i = 0; i < 10; i++) {
    worksheet['!cols'].push({ wch: 18 }); // Adjust column width
  }

  // Default cell style
  const defaultStyle = { alignment: { horizontal: 'center' } };

  // Create the !styles format
  worksheet['!styles'] = {};

  // Format cells and add styles
  const range = XLSX.utils.decode_range(worksheet['!ref']);

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

      // Skip if cell doesn't exist
      if (!worksheet[cellRef]) continue;

      // Add default style
      worksheet[cellRef].s = JSON.parse(JSON.stringify(defaultStyle));

      // Add specific styles based on content

      // Main title rows (e.g., "Driven By Room Utilization")
      if (row === 0 || row === data.findIndex(r => r[0] === 'Driven By Provider Productivity Target')) {
        worksheet[cellRef].s.font = { bold: true, color: { rgb: "FFFFFF" }, sz: 14 };
        worksheet[cellRef].s.fill = { fgColor: { rgb: "4CAF50" } };
        worksheet[cellRef].s.alignment = { horizontal: 'center' };
      }
      // Section titles (e.g., "AVERAGE VOLUME")
      else if (data[row] && data[row][0] === 'AVERAGE VOLUME' || data[row] && data[row][0] === 'PEAK MONTH VOLUME') {
        worksheet[cellRef].s.font = { bold: true, sz: 12 };
        worksheet[cellRef].s.fill = { fgColor: { rgb: "E2F0D9" } };
      }
      // Headers
      else if ((row === 3 || row === data.findIndex(r => r[0] === 'Year' && data[row - 1][0] === 'AVERAGE VOLUME') ||
        row === data.findIndex(r => r[0] === 'Year' && data[row - 1][0] === 'PEAK MONTH VOLUME'))) {
        worksheet[cellRef].s.font = { bold: true };
        worksheet[cellRef].s.fill = { fgColor: { rgb: "BDD7EE" } };
        worksheet[cellRef].s.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      // Data cells
      else if (row > 3) {
        worksheet[cellRef].s.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Add zebra striping for data rows
        if (row % 2 === 0) {
          worksheet[cellRef].s.fill = { fgColor: { rgb: "F5F5F5" } };
        }
      }

      // Summary sheet headers
      if (data[0] && data[0][0] === 'Input Parameters' && row === 0) {
        worksheet[cellRef].s.font = { bold: true };
        worksheet[cellRef].s.fill = { fgColor: { rgb: "4CAF50" } };
        worksheet[cellRef].s.font = { bold: true, color: { rgb: "FFFFFF" } };
      }
    }
  }
}

// Function to get Room Utilization data with proper titles
function getRoomUtilizationData() {
  const data = [];

  // Main title
  data.push(['Driven By Room Utilization', '', '', '', '']);
  data.push(['', '', '', '', '']);  // Empty row for spacing

  // Average Volume section
  data.push(['AVERAGE VOLUME', '', '', '', '']);

  // Get header row for Average Volume
  const headers1 = Array.from(document.querySelectorAll('#resultsTable thead th')).map(th => th.textContent.trim());
  data.push(headers1);

  // Get data rows for Average Volume
  const rows1 = document.querySelectorAll('#outputTbody tr');
  rows1.forEach(row => {
    const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
    data.push(rowData);
  });

  data.push(['', '', '', '', '']);  // Empty row for spacing

  // Peak Month Volume section
  data.push(['PEAK MONTH VOLUME', '', '', '', '']);

  // Get header row for Peak Month Volume
  const headers2 = Array.from(document.querySelectorAll('#resultsTable2 thead th')).map(th => th.textContent.trim());
  data.push(headers2);

  // Get data rows for Peak Month Volume
  const rows2 = document.querySelectorAll('#outputTbody2 tr');
  rows2.forEach(row => {
    const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
    data.push(rowData);
  });

  return data;
}

// Function to get Provider Productivity data with proper titles
function getProviderProductivityData() {
  const data = [];

  // Main title
  data.push(['Driven By Provider Productivity Target', '', '', '', '']);
  data.push(['', '', '', '', '']);  // Empty row for spacing

  // Average Volume section
  data.push(['AVERAGE VOLUME', '', '', '', '']);

  // Get header row for Average Volume
  const headers1 = Array.from(document.querySelectorAll('#resultsTable3 thead th')).map(th => th.textContent.trim());
  data.push(headers1);

  // Get data rows for Average Volume
  const rows1 = document.querySelectorAll('#outputTbody3 tr');
  rows1.forEach(row => {
    const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
    data.push(rowData);
  });

  data.push(['', '', '', '', '']);  // Empty row for spacing

  // Peak Month Volume section
  data.push(['PEAK MONTH VOLUME', '', '', '', '']);

  // Get header row for Peak Month Volume
  const headers2 = Array.from(document.querySelectorAll('#resultsTable4 thead th')).map(th => th.textContent.trim());
  data.push(headers2);

  // Get data rows for Peak Month Volume
  const rows2 = document.querySelectorAll('#outputTbody4 tr');
  rows2.forEach(row => {
    const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
    data.push(rowData);
  });

  return data;
}

// Function to get input parameters for summary sheet
function getSummaryData() {
  const data = [
    ['Input Parameters', 'Value'],
    ['Annual Growth Target', document.getElementById('annual-growth-target').value],
    ['Average Clinic Visit Time (min)', document.getElementById('avg-clinic-visit-time').value],
    ['Clinic Operation Days Per Year', document.getElementById('clinic-operation-days-per-year').value],
    ['Clinic Operation Hours Per Day', document.getElementById('clinic-operation-hours-per-day').value],
    ['Current Exam Rooms Per Provider', document.getElementById('current-exam-rooms-per-provider').value],
    ['Patient Visits', document.getElementById('patient-visits').value],
    ['Peak Month Volume', document.getElementById('peak-month-volume').value],
    ['Provider Productivity, Current', document.getElementById('provider-productivity-current').value],
    ['Provider Productivity, Target', document.getElementById('provider-productivity-target').value],
    ['Room Utilization Target (%)', roomUtilizationTarget],
    ['', ''],
    ['Export Date', new Date().toLocaleString()]
  ];

  return data;
}

// Improved function to show export message as a notification in the bottom left
function showExportMessage(message, type) {
  const container = document.getElementById('notification-container');

  if (!container) {
    console.error('Notification container not found');
    return;
  }

  // Create a new notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to container
  container.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');

    // Wait for transition to complete before removing
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// Call this when the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Call the function to add the export button
  setTimeout(addExportButton, 600); // Add a slight delay to ensure other scripts have run
});