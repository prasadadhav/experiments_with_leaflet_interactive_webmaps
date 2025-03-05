// Initialize the map and set its view to Luxembourg
var map = L.map('map').setView([49.8153, 6.1296], 8);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Layer groups for different administrative levels
var communesLayer, cantonsLayer, countryLayer;

// Function to style each region
function style(feature) {
    return {
        fillColor: 'lightgreen',
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.7
    };
}

// Function to highlight feature on hover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        fillColor: 'blue',
        fillOpacity: 1
    });
    layer.bindPopup(layer.feature.properties.NAME).openPopup();
}

// Function to reset highlight on mouseout
function resetHighlight(e) {
    e.target.setStyle(style(e.target.feature));
    e.target.closePopup();
}

// Function to add interactivity to each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

// Load and display the communes GeoJSON
fetch('data/communes4326.geojson')
    .then(response => response.json())
    .then(data => {
        communesLayer = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        });
    });

// Load and display the cantons GeoJSON
fetch('data/limadmin.geojson')
    .then(response => response.json())
    .then(data => {
        cantonsLayer = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        });
    });

// Load and display the country boundary GeoJSON
fetch('data/limadmin.geojson')
    .then(response => response.json())
    .then(data => {
        countryLayer = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        });
    });

// Layer control to toggle visibility
var overlayMaps = {
    "Communes": communesLayer,
    "Cantons": cantonsLayer,
    "Country": countryLayer
};

L.geoJSON(communes4326.geojson).addTo(map);

L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
