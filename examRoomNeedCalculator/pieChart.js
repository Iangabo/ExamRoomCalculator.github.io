document.addEventListener("DOMContentLoaded", function () {
    // these represent the initial values for the three components
    // their sum equals the initial total of 45 minutes
    let breakdownValues = [12.5, 13, 19.5]; // [MA Visit, Wait in Exam, Provider Visit]
  
    // DOM References
    const avgClinicVisitInput = document.getElementById("avg-clinic-visit-time");
    const maVisitInput = null; 
    
    // we treat the total field as the master for the 100% value
    // we attach an event listener on it so that if the user manually changes it, it rescales the breakdown values proportionally
    avgClinicVisitInput.addEventListener("input", function () {
      const newTotal = parseFloat(avgClinicVisitInput.value) || 0;
      const oldTotal = breakdownValues.reduce((a, b) => a + b, 0);
      if (oldTotal === 0) {
        // distribute equally
        breakdownValues = [newTotal / 3, newTotal / 3, newTotal / 3];
      } else {
        const factor = newTotal / oldTotal;
        breakdownValues = breakdownValues.map(val => val * factor);
      }
      updatePieChart();
    });
  
    // init pie chart
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    let myPieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["MA Visit", "Wait in Exam", "Provider Visit"],
        datasets: [{
          label: "Clinic Visit Time",
          data: [...breakdownValues],
          backgroundColor: [
            "#0096D7", // MA Visit
            "#B3D335", // Wait in Exam
            "#FF9800"  // Provider Visit
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            formatter: (value, ctx) => {
              const dataset = ctx.chart.data.datasets[0];
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              return `${value.toFixed(1)} min\n(${percentage})`;
            },
            color: "#fff",
            font: { weight: "bold" }
          },
          title: {
            display: true,
            text: " Clinic Visit Room Time",
            font: {
                        size: 17,        
                        weight: 'bold'   
                    },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const dataset = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total ? ((tooltipItem.parsed / total) * 100).toFixed(1) + "%" : "0%";
                return `${tooltipItem.label}: ${tooltipItem.parsed.toFixed(1)} min (${percentage})`;
              }
            }
          }
        },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const sliceIndex = elements[0].index;
          const label = myPieChart.data.labels[sliceIndex];
          const oldValue = breakdownValues[sliceIndex];
          const newValue = parseFloat(prompt(`Enter new minutes for ${label}:`, oldValue));
          if (isNaN(newValue) || newValue < 0) return;
          // when a slice is updated:
          // new total = old total - old slice + new slice
          const oldTotal = breakdownValues.reduce((a, b) => a + b, 0);
          breakdownValues[sliceIndex] = newValue;
          const newTotal = breakdownValues.reduce((a, b) => a + b, 0);
          // update total field to reflect new total
          avgClinicVisitInput.value = newTotal.toFixed(1);
          updatePieChart();
        }
      },
      plugins: [ChartDataLabels]
    });
  
    function updatePieChart() {
      // update the pie chart dataset from breakdownValues
      myPieChart.data.datasets[0].data = breakdownValues.map(val => parseFloat(val.toFixed(1)));
      myPieChart.update();
    }
  
    // initital setup: set  total field to sum of breakdown values
    function initializeTotal() {
      const total = breakdownValues.reduce((a, b) => a + b, 0);
      avgClinicVisitInput.value = total.toFixed(1);
    }
  
    initializeTotal();
    updatePieChart();
  });