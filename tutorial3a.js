// Initialize the map and set its view to Luxembourg
var map = L.map('map').setView([49.8153, 6.1296], 9.25);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Define styles for the geojson layers
var defaultStyle = {
    color: "yellow",
    weight: 2,
    opacity: 0.5,
    fillOpacity: 0.5
};

var highlightStyle = {
    color: "red",
    weight: 2,
    opacity: 0.5,
    fillOpacity: 0.5
};

var selectedLayer = null;

// Function to reset style on mouseout
function resetHighlight(e) {
    var layer = e.target;
    if (layer !== selectedLayer) {
        layer.setStyle(defaultStyle);
    }
}

// Function to highlight feature on mouseover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(highlightStyle);
    layer.bringToFront();
}



// Define canton mapping with weighted WWTP contributions
const cantonWeightMapping = {
    "Luxembourg": { "BEG": 1.0, "HES": 1.0, "UEB": 1.0 },
    "Esch-sur-Alzette": { "BET": 1.0, "SCH": 1.0, "PET": 1.0 },
    "Diekirch": { "BLE": 0.7 },
    "Vianden": { "BLE": 0.3 },
    "Mersch": { "MER": 1.0 },
    "Echternach": { "ECH": 1.0 },
    "Grevenmacher": { "GRE": 1.0 },
    "Redange": { "BOE": 1.0 },
    "Wiltz": { "WIL": 1.0 },
    "Remich": { "NA": 1.0 },
    "Capellen": { "NA": 1.0 },
    "Luxembourg National": { "Nat": 1.0 }
};

// check function

// Get weighted value for a canton from WWTP-level data
function computeCantonValue(canton, dataObject, indicatorPrefix) {
    const wwtps = cantonWeightMapping[canton];
    let value = 0.0;

    if (!wwtps) return value; // If mapping is not found

    for (const [wwtpCode, weight] of Object.entries(wwtps)) {
        const propertyName = `${indicatorPrefix}-${wwtpCode}`;
        const wwtpValue = dataObject?.[propertyName] || 0;
        value += wwtpValue * weight;
    }

    return value;
}


// Function to handle each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function(e) {
            if (selectedLayer) {
                selectedLayer.setStyle(defaultStyle);
            }
            selectedLayer = e.target;
            highlightFeature(e);

            // Mapping of canton codes to names
            var wwtpMapping = {
                "BEG": "Beggen",
                "BET": "Bettembourg",
                "SCH": "Schifflange",
                "BLE": "Bleesbruck",
                "MER": "Mersch",
                "PET": "Pétange",
                "HES": "Hesperange",
                "ECH": "Echternach",
                "UEB": "Uebesyren",
                "GRE": "Grevenmacher",
                "VIE": "Vianden",
                "BOE": "Boevange/Attert",
                "WIL": "Wiltz",
                "Nat": "National"
            };

            // Mapping of canton codes to names
            var cantonMapping = {
                "BEG": "Beggen",
                "BET": "Bettembourg",
                "SCH": "Schifflange",
                "BLE": "Bleesbruck",
                "MER": "Mersch",
                "PET": "Pétange",
                "HES": "Hesperange",
                "ECH": "Echternach",
                "UEB": "Uebesyren",
                "GRE": "Grevenmacher",
                "VIE": "Vianden",
                "BOE": "Boevange/Attert",
                "WIL": "Wiltz",
                "Nat": "Nat"
            };

            // Fetch and display data from excel files
            Promise.all([
                fetch('data/Data_Flu.xlsx').then(response => response.arrayBuffer()),
                fetch('data/Data_RSV.xlsx').then(response => response.arrayBuffer()),
                fetch('data/Data_SARCoV.xlsx').then(response => response.arrayBuffer())
            ])
            .then(([fluData, rsvData, sarCovData]) => {
                var fluWorkbook = XLSX.read(fluData, { type: 'array' });
                var rsvWorkbook = XLSX.read(rsvData, { type: 'array' });
                var sarCovWorkbook = XLSX.read(sarCovData, { type: 'array' });

                var fluSheet = fluWorkbook.Sheets[fluWorkbook.SheetNames[0]];
                var rsvSheet = rsvWorkbook.Sheets[rsvWorkbook.SheetNames[0]];
                var sarCovSheet = sarCovWorkbook.Sheets[sarCovWorkbook.SheetNames[0]];

                var fluJson = XLSX.utils.sheet_to_json(fluSheet);
                var rsvJson = XLSX.utils.sheet_to_json(rsvSheet);
                var sarCovJson = XLSX.utils.sheet_to_json(sarCovSheet);

                var cantonName = feature.properties.CANTON || feature.properties.canton || feature.properties.WWTP || feature.properties.name;
                var cantonCode = Object.keys(cantonMapping).find(key => cantonMapping[key] === cantonName);
                var latestWeek = fluJson[fluJson.length - 1]['yyyy-w'];

                // Construct the property name dynamically for Flu
                var fluAPropertyName = `FluA-${cantonCode}`;
                var fluBPropertyName = `FluB-${cantonCode}`;
                var fluA = fluJson[fluJson.length - 1]?.[fluAPropertyName] || 0;
                var fluB = fluJson[fluJson.length - 1]?.[fluBPropertyName] || 0;

                // Construct the property name dynamically for RSV
                var rsvPropertyName = `RSV-${cantonCode}`;
                var rsv = rsvJson[rsvJson.length - 1]?.[rsvPropertyName] || 0;

                // Construct the property name dynamically for SARS-CoV
                var sarCovPropertyName = `SARS-CoV-${cantonCode}`;
                var sarCov = sarCovJson[sarCovJson.length - 1]?.[sarCovPropertyName] || 0;

                if (cantonName === "Nat") {
                    cantonName = "Luxembourg National Data";
                }



                var popupContent = `<b>Name: </b>${cantonName}<br>
                                    <b>FluA: </b>${fluA}<br>
                                    <b>FluB: </b>${fluB}<br>
                                    <b>RSV: </b>${rsv}<br>
                                    <b>SARCoV: </b>${sarCov}`;

                layer.bindPopup(popupContent).openPopup();
            })
            .then(() => {
                console.log('Data loaded and processed successfully.');
            })
            .catch(error => {
                console.error('Error fetching or processing data:', error);
            });
        }
    });
}


const colorScale = chroma.scale(['#FFEDA0', '#800026']).domain([0, 1000]);  // from light yellow to dark red
function getColor(value) {
    return colorScale(value).hex();
}


function popDensityStyle(feature) {
    return {
        fillColor: getColor(feature.properties.density),  // adjust to your property name
        weight: 0.5,
        opacity: 0.3,
        color: 'grey',
        fillOpacity: 0.5
    };
}


// Load the geojson files
var communesLayer = L.geoJson(null, {
    style: {
        color: "black",
        weight: 2,
        opacity: 0.1,
        fillOpacity: 0
    }
}); //.addTo(map);

var wwtpLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var cantonsLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var countryLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var popDensityLayer = L.geoJson(null, {
    style: popDensityStyle
});

// Fetch and add geojson data to layers
fetch('data/communes4326.geojson')
    .then(response => response.json())
    .then(data => communesLayer.addData(data));

fetch('data/wwtp_catchments_updated.geojson')
    .then(response => response.json())
    .then(data => wwtpLayer.addData(data));

fetch('data/cantons.geojson')
    .then(response => response.json())
    .then(data => cantonsLayer.addData(data));

fetch('data/lux.geojson')
    .then(response => response.json())
    .then(data => countryLayer.addData(data));

fetch('data/lux_pop_density.geojson')
    .then(response => response.json())
    .then(data => popDensityLayer.addData(data));

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
    
    // Add title (optional)
    div.innerHTML += '<h4>Population Density</h4>';

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};
// legend.addTo(map);    

    
    

// Add layer control to the map
var baseMaps = {};
var overlayMaps = {
    "WWTP": wwtpLayer,
    "Cantons": cantonsLayer,
    "Country": countryLayer
};

var densityMaps = {
    "Population Density": popDensityLayer,
    "Commune Borders": communesLayer
};

L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: false
}).addTo(map);

L.control.layers(baseMaps, densityMaps, {
    position: 'topright',
    collapsed: false
}).addTo(map);

// Ensure only one layer is active at a time
map.on('overlayadd', function(e) {
    for (var layer in overlayMaps) {
        if (overlayMaps[layer] !== e.layer) {
            map.removeLayer(overlayMaps[layer]);
        }
    }
});

map.on('overlayadd', function (e) {
    if (e.name === "Population Density") {
        legend.addTo(map);
    }
});
map.on('overlayremove', function (e) {
    if (e.name === "Population Density") {
        map.removeControl(legend);
    }
});



var recenterControl = L.control({ position: 'topleft' });

recenterControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    div.style.backgroundColor = 'white';
    div.style.width = '34px';
    div.style.height = '34px';
    div.style.cursor = 'pointer';
    div.style.textAlign = 'center';
    div.style.lineHeight = '34px';
    div.style.fontSize = '20px';
    div.title = 'Recenter Map';
    div.innerHTML = '⟳';  // You can replace with an icon if preferred
    
    div.onclick = function () {
        map.setView([49.8153, 6.1296], 9.25);  // Luxembourg center
    };
    
    return div;
};

recenterControl.addTo(map);
