let currentFile = "floor30.csv";
let plotData = [];

// Handle floor selector change
document.getElementById("sensorSelect").addEventListener("change", function () {
    currentFile = this.value;
    loadData(currentFile);
});

// Load and process CSV file
function loadData(fileName) {
    d3.csv(fileName).then(data => {
        data.forEach(d => {
            d.datetime = new Date(d.datetime);
            d.ta = +d.ta;
            d.tg = +d.tg;
        });

        // Filter out bad readings
        const validData = data.filter(d => d.ta > 10 && d.tg > 10);
        createVisualization(validData, fileName);
    });
}

// Create the Plotly chart
function createVisualization(data, fileName) {
    const xValues = data.map(d => d.datetime);
    const taValues = data.map(d => d.ta);
    const tgValues = data.map(d => d.tg);

    const traceTa = {
        x: xValues,
        y: taValues,
        mode: 'lines',
        name: 'Air Temperature (ta)',
        line: { color: 'lightgreen' }, // purple
        visible: true
    };

    const traceTg = {
        x: xValues,
        y: tgValues,
        mode: 'lines',
        name: 'Globe Temperature (tg)',
        line: { color: '#A2559D' }, // pastel red
        visible: true
    };

    // Fake trace to add a legend entry for the IEQ standards shaded area
    const traceIEQ = {
        x: [xValues[0]],
        y: [18],
        mode: 'lines',
        name: 'IEQ Preferred Range (18-25°C)',
        line: { color: 'lightgrey' },
        showlegend: true,
        visible: 'legendonly'
    };

    plotData = [traceTa, traceTg, traceIEQ];

    const xStart = new Date('2019-01-01T00:00:00');
    const xEnd = new Date('2019-03-31T23:59:59');

    const layout = {
        title: `Temperature Trends Across Floors 28-30`,
        height: 800,
        xaxis: {
            title: "Month",
            range: [xStart, xEnd],
            tickvals: [
                new Date('2019-01-01'),
                new Date('2019-02-01'),
                new Date('2019-03-01')
            ],
            ticktext: ["Jan", "Feb", "Mar"]
        },
        yaxis: {
            title: "Temperature (°C)",
            range: [15, 30]
        },
        annotations: [],
        shapes: [
            {
                type: 'rect',
                xref: 'paper',
                x0: 0,
                x1: 1,
                yref: 'y',
                y0: 18,
                y1: 25,
                fillcolor: 'lightgrey',
                opacity: 0.3,
                line: {
                    width: 0
                }
            }
        ]
    };

    Plotly.newPlot('plot', plotData, layout);
}

// Handle toggle button clicks
function showTrace(type) {
    if (!plotData.length) return;

    let visibility = [true, true, 'legendonly'];
    let newTitle = "";

    if (type === "ta") {
        visibility = [true, false, 'legendonly'];
        newTitle = "Air Temperature (ta)";
    } else if (type === "tg") {
        visibility = [false, true, 'legendonly'];
        newTitle = "Globe Temperature (tg)";
    } else {
        visibility = [true, true, 'legendonly'];
        newTitle = "Air and Globe Temperatures";
    }

    Plotly.update('plot', { visible: visibility }, { title: newTitle });
}

// Initial load
loadData(currentFile);
