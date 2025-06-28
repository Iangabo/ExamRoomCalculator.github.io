document.addEventListener("DOMContentLoaded", function () {
    let porcentaje = roomUtilizationTarget;
    const canvas = document.getElementById('donnutChart');
    const ctx = canvas.getContext('2d');

    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [porcentaje, 100 - porcentaje],
                backgroundColor: ['#088eb0', '#E0E0E0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 270, 
            cutout: '50%',
            plugins: {
                title: {
                    display: true,
                    text: "Room Utilization",
                    font: {
                        size: 17,        
                        weight: 'bold'   
                    },
                },
                legend: { display: false },
                tooltip: { enabled: false }
            },
            events: ['click'],
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function (chart) {
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;

                ctx.save();
                const fontSize = height / 9;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';

                const textX = width * 0.4;
                const textY = height * 0.65;

                chart.customCenterText = {
                    x: textX,
                    y: textY,
                    fontSize: fontSize
                };

                ctx.fillStyle = "#088eb0";
                ctx.font = `bold ${fontSize + 1}px Arial`;
                ctx.fillText(`${porcentaje}%`, textX, textY);

                ctx.font = `bold ${fontSize * 0.5}px Arial`;
                ctx.fillStyle = "#666";
                ctx.fillText("TARGET", textX, textY + fontSize + 5);
                ctx.font = `${fontSize * 0.5}px Arial`;
                ctx.restore();
            }
        }]
    });

    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const center = myChart.customCenterText;
        if (!center) return;

        const boxSize = center.fontSize;
        const isInCenterText =
            x >= center.x - 70 && x <= center.x + boxSize / 2 &&
            y >= center.y && y <= center.y + boxSize * 2;

        if (isInCenterText) {
            const input = prompt("Enter new target percentage:", porcentaje);
            if (input === null) return;

            const newValue = parseInt(input);
            if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
                porcentaje = newValue;
                roomUtilizationTarget = porcentaje;
                updateDonnutChart();
                window.updateChart(getPrecalculatedData());
            } else {
                alert("Please enter a valid number between 0 and 100.");
            }
        }
    });

    function updateDonnutChart() {
        myChart.data.datasets[0].data = [porcentaje, 100 - porcentaje];
        myChart.update();
        window.calculateDataForSelectedYears();
    }
});
