//var geometry = draw your rectangle/polygon.
Map.centerObject(geometry,12);

function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2017-01-01', '2020-01-30')
                  .filterBounds(geometry)
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',1))
                  .map(maskS2clouds);
                  
var demdata = ee.ImageCollection("COPERNICUS/DEM/GLO30")
              .select('DEM')
              .filterBounds(geometry);
              
var elevationVis = {
  min: 0.0,
  max: 1000.0,
  palette: ['0000ff','00ffff','ffff00','ff0000','ffffff'],
};


var expImg = dataset.median()
print(expImg)
var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

print(demdata.first())


Map.addLayer(demdata.mean(), elevationVis, 'DEM');

Map.addLayer(expImg, visualization, 'RGB');
/**/
//Image export
Export.image.toDrive({
  image: expImg.select(["B4","B3","B2"]),
  description: 'Faroe',
  folder: 'ee_demos',
  region: geometry,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

//DEM export
Export.image.toDrive({
  image: demdata.mean(),
  description: 'Faroe_DEM',
  folder: 'ee_demos',
  region: geometry,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
