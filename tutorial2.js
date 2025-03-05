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

// Here we add an icon to the map
// This is a specific icon, that needs settings
var test_icon = L.icon({
    iconUrl: 'images/Enterovirus.svg',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [50, 50], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.marker([49.497511, 5.957766], {icon: test_icon}).addTo(map);

// Creating an icon class
var LeafIcon = L.Icon.extend({
    options: {
        // shadowUrl: 'leaf-shadow.png',
        iconSize:     [38, 95],
        // shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        // shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

var fluIcon = new LeafIcon({iconUrl: 'images/Influenza.svg'}),
    rsvIcon = new LeafIcon({iconUrl: 'images/RSV.svg'}),
    SARSCoV2Icon = new LeafIcon({iconUrl: 'images/SARSCoV2.svg'});

L.marker([49.50537, 5.952101], 
    {icon: fluIcon}, 
    {alt: 'I am a flu icon.'})
    .addTo(map)
    .bindPopup("I am a flu icon.");

L.marker([49.491657, 5.977335], 
    {icon: rsvIcon}, 
    {alt: 'I am a rsv.'})
    .addTo(map)
    .bindPopup("I am a rsv.");

L.marker([49.507488, 5.982313], 
    {icon: SARSCoV2Icon}, 
    {alt: 'I am a SARSCoV2.'})
    .addTo(map)
    .bindPopup("I am an SARSCoV2.");

// This is to quickly see the coordinates of a point on the map
// Interactions and events
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);