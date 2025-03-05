// Initialize the map and set its view to Luxembourg
// After the coordinates of Luxembourg, we have the zoom level of 8
// var map = L.map('map').setView([49.8153, 6.1296], 8);

// Here I have added the coordinates of Esch-sur-Alzette, Luxembourg
// The zoom level is 12, more the number, the more zoomed in the map is
var map = L.map('map').setView([49.5024, 5.9722], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var esch_marker = L.marker([49.506812061292486, 5.9437363452558145]).addTo(map);


// This is to add a CIRCLE
// The radius is in meters
// The border color is red, the fill color is a lighter red, and the fill opacity is 0.5
var esch_circle = L.circle([49.5024, 5.9722], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 1000
}).addTo(map);

// This is to add a POLYGON
// On Google Maps, we can right click and see the coordinates
// Here we can add as many points as we want to create a polygon
// The border color is black, the fill color is lightgreen, and the fill opacity is 0.7
var esch_polygon = L.polygon([
    [49.50398398190072, 5.965590015288848],
    [49.49054892308482, 5.976960576782649],
    [49.498270760994124, 5.9902650657165895]
]).addTo(map);

// This is to add a POPUP, the openPopup() function is to open the popup by default
// For each popup use the variable name of the object and bindPopup() to add the text
esch_marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
esch_circle.bindPopup("I am a circle.");
esch_polygon.bindPopup("I am a polygon.");

// When I want to do more with pop-up, I can create a pop-up object
// and then use this obj to bind the pop-up to the object
// var my_popup = L.popup()
//     .setLatLng([49.502864306052544, 5.964818544813563])
//     .setContent("I am a standalone popup.")
//     .openOn(map);

// Interactions and events
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);