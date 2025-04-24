document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("myChart").getContext("2d");
  let myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [], // dynamic labels based on selected years
      datasets: [
        {
          label: "Rooms Needed",
          data: [],
          backgroundColor: "rgba(144, 238, 144, 0.7)",
          yAxisID: "y1"
        },
        {
          label: "Providers Needed",
          data: [],
          backgroundColor: "rgba(255, 165, 0, 0.7)",
          yAxisID: "y1"
        },
        {
          label: "Visits per Year",
          type: "line",
          data: [],
          borderColor: "rgba(30, 144, 255, 1)",
          backgroundColor: "rgba(30, 144, 255, 0.2)",
          tension: 0.4,
          fill: false,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Rooms Needed, Providers Needed, and Visits Per Year",
          font: { size: 16, weight: "bold" }
        },
        subtitle: {
          display: true,
          text: "DRIVEN BY ROOM UTILIZATION",
          font: { size: 12, style: "italic" }
        }
      },
      responsive: true,
      scales: {
        y1: {
          position: "left",
          beginAtZero: true,
          max: 40,
          ticks: { stepSize: 5 }
        },
        y2: {
          position: "right",
          beginAtZero: true,
          max: 55000,
          ticks: { stepSize: 5000 },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // Global function to update the chart based on currently active years
  window.updateChart = function (precalculatedData = null) {
    let years = [];
    let roomsData = [];
    let providersData = [];
    let visitsData = [];

    if (precalculatedData && Array.isArray(precalculatedData)) {
        precalculatedData.forEach(({ year, rooms, providers, visits }) => {
            years.push(year);
            roomsData.push(rooms);
            providersData.push(providers);
            visitsData.push(visits);
        });
    } else {
        const activeYearButtons = document.querySelectorAll(".year-button.active");
        activeYearButtons.forEach(btn => {
            const year = btn.dataset.year;
            const roomEl = document.getElementById("rooms" + year);
            const providerEl = document.getElementById("providers" + year);
            const visitsEl = document.getElementById("visits" + year);
            years.push(year);
            roomsData.push(roomEl ? parseFloat(roomEl.textContent) : 0);
            providersData.push(providerEl ? parseFloat(providerEl.textContent) : 0);
            visitsData.push(visitsEl ? parseFloat(visitsEl.textContent) : 0);
        });
    }

    const maxY1 = Math.max(...roomsData, ...providersData);
    const maxY2 = Math.max(...visitsData);

    const marginY1 = maxY1 * 0.1;
    const marginY2 = maxY2 * 0.1;

    const roundedMaxY1 = Math.ceil((maxY1 + marginY1) / 5) * 5 || 5;
    const roundedMaxY2 = Math.ceil((maxY2 + marginY2) / 5000) * 5000 || 5000;

    myChart.data.labels = years;
    myChart.data.datasets[0].data = roomsData;
    myChart.data.datasets[1].data = providersData;
    myChart.data.datasets[2].data = visitsData;

    myChart.options.scales.y1.max = roundedMaxY1;
    myChart.options.scales.y2.max = roundedMaxY2;

    myChart.update();
};

  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateChart(getPrecalculatedData()));
  });
  updateChart(getPrecalculatedData());
  
});