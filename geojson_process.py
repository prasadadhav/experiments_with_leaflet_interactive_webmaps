import geopandas as gpd
from shapely.ops import unary_union

# Load the GeoJSON file
communes = gpd.read_file('data/communes4326.geojson')

# Group by 'CANTON' and merge the polygons
cantons = communes.dissolve(by='CANTON', aggfunc='sum')

# Save the result to a new GeoJSON file
cantons.to_file('data/cantons.geojson', driver='GeoJSON')