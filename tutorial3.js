// Initialize the map and set its view to Luxembourg
var map = L.map('map').setView([49.8153, 6.1296], 9.25);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Define styles for the geojson layers
var defaultStyle = {
    color: "lightgreen",
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
            var cantonMapping = {
                "SCH": "Schifflange",
                "PET": "Pétange",
                "BEG": "Beggen",

                "BET": "Bettembourg",
                "BLE": "Clervaux",
                "MER": "Mersch",

                "HES": "Hesperange",
                "ECH": "Echternach",
                "UEB": "Remich",

                "GRE": "Grevenmacher",
                "VIE": "Vianden",
                "BOE": "Redange",

                "WIL": "Wiltz",

                "Nat": "National"
            };

            // Fetch and display data from excel files
            Promise.all([
                fetch('data/Data_Flu.xlsx').then(response => response.arrayBuffer()),
                fetch('data/Data_RSV.xlsx').then(response => response.arrayBuffer()),
                fetch('data/Data_SARCoV.xlsx').then(response => response.arrayBuffer())
                // fetch('data/data_Flu.xlsx').then(response => response.arrayBuffer()),
                // fetch('data/data_RSV.xlsx').then(response => response.arrayBuffer()),
                // fetch('https://github.com/prasadadhav/experiments_with_leaflet_interactive_webmaps/blob/master/data/data_SARCoV.xlsx?raw=true').then(response => response.arrayBuffer())
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

                var cantonName = feature.properties.CANTON || feature.properties.canton || feature.properties.name;
                var cantonCode = Object.keys(cantonMapping).find(key => cantonMapping[key] === cantonName);
                var latestWeek = fluJson[fluJson.length - 1]['yyyy-w'];

                var fluA = fluJson.find(row => row.Canton === cantonCode && row['yyyy-w'] === latestWeek)?.FluA || 0;
                var fluB = fluJson.find(row => row.Canton === cantonCode && row['yyyy-w'] === latestWeek)?.FluB || 0;

                // Construct the property name dynamically for RSV
                var rsvPropertyName = `RSV-${cantonCode}`;
                var rsv = rsvJson[rsvJson.length - 1]?.[rsvPropertyName] || 0;

                // Construct the property name dynamically for SARS-CoV
                var sarCovPropertyName = `SARS-CoV-${cantonCode}`;
                var sarCov = sarCovJson[sarCovJson.length - 1]?.[sarCovPropertyName] || 0;

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

// Load the geojson files
var communesLayer = L.geoJson(null, {
    style: {
        color: "black",
        weight: 2,
        opacity: 0.1,
        fillOpacity: 0
    }
}).addTo(map);

var cantonsLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var countryLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

// Fetch and add geojson data to layers
fetch('data/communes4326.geojson')
    .then(response => response.json())
    .then(data => communesLayer.addData(data));

fetch('data/cantons.geojson')
    .then(response => response.json())
    .then(data => cantonsLayer.addData(data));

fetch('data/lux.geojson')
    .then(response => response.json())
    .then(data => countryLayer.addData(data));

// Add layer control to the map
var baseMaps = {};
var overlayMaps = {
    "Cantons": cantonsLayer,
    "Country": countryLayer
};

L.control.layers(baseMaps, overlayMaps, {
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

