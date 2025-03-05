// To render a map, the API needs to know the element where to display the map (target),
// the predefined background layer (bgLayer) to display,
// the predefined layers (layers),
// the starting zoom level (zoom),
// the central position of the map (position)
const customJson = {
  "version": 8,
  "name": "Geoportail.lu Road Map",
  "sources": {
    "geoportail.lu_layers": {
      "type": "vector",
      "url": "https://vectortiles.geoportail.lu/data/omt-geoportail-lu.json"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "layout": {"visibility": "visible"},
      "paint": {"background-color": "rgba(248, 248, 248, 1)"}
    },
    {
      "id": "lu_landcover_wood",
      "type": "fill",
      "source": "geoportail.lu_layers",
      "source-layer": "landcover",
      "filter": ["==", "class", "wood"],
      "paint": {"fill-color": "rgba(115, 179, 28, 1)", "fill-opacity": 0.55}
    },
    {
      "id": "lu_water",
      "type": "fill",
      "source": "geoportail.lu_layers",
      "source-layer": "water",
      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "intermittent", 1]],
      "layout": {"visibility": "visible"},
      "paint": {"fill-color": "rgba(0, 27, 255, 1)"}
    },
  ],
  "id": "+geoportail_lu_road_map"
};

const map19 = new lux.Map({
  target: 'map19',
  bgLayer: 'basemap_2015_global',
  bgLayerStyle: customJson,
  zoom: 10,
  position: [76771, 72205]
});