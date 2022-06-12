// Record the URL where the API data request will be made:
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create a function which changes the radius of each cirlcular marker based on the magnitude size of the quake:
function circleRadiusSize(mag) {
  return mag * 25000;
}

// Create a function which changes the colour of each circular marker based on the magnitude size of the earthquake:
// Colour codes from https://htmlcolorcodes.com/color-chart/.
function circleColour(mag) {
  if (mag <= 1) {
      return "#82E0AA";
  } else if (mag <= 2) {
      return "#F9E79F";
  } else if (mag <= 3) {
      return "#E59866";
  } else if (mag <= 4) {
      return "#DC7633";
  } else if (mag <= 5) {
      return "#CD6155";
  } else {
      return "#FF0000";
  };
}

// Request the JSON data from the queryURL. 
// Send 'data.features' elements to a function called 'layerCharacteristics':
d3.json(queryURL, function(data) {
  layerCharacteristics(data.features);
});

// Create 'layerCharacteristics' function: 
function layerCharacteristics(rawData) {

  // Create a layer for the map called 'earthquakes' on which to place the markers:
  var earthquakes = L.geoJSON(rawData, {

    /// Define a function that runs once for each feature in the 'features' array:
    /// Allocate each feature its own popup on the layer.
    onEachFeature : function (feature, layer) {
      layer.bindPopup("<h3> Location: " + feature.properties.place +
      "</h3><hr><p> Date: " + new Date(feature.properties.time) + "</p>" + 
      "</h3><hr><p> Magnitude of Quake: " +  feature.properties.mag + "</p>" +
      "</h3><hr><p> Tsunamis Caused: " +  feature.properties.tsunami + "</p>")
    },   
    
    // Define a function that adds the circular markers to the layer using previously specified characteristic:  
    pointToLayer: function (feature, coordinates) {
      return new L.circle(coordinates,
        {radius: circleRadiusSize(feature.properties.mag),
        fillColor: circleColour(feature.properties.mag),
        fillOpacity: 1,
        stroke: false,
      })
    }
  });
    
    // Append our new 'earthquakes' layer to the createMap function:
    createMap(earthquakes);
}

// Create a function which builds the map itself:
function createMap(earthquakes) {

  // Define light map layer:
  var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  // Define dark map layer:
  var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
  });

  // Define satellite map layer:
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
  });


  // Create a baseMaps variable to hold the three base layers:
  var baseMaps = {
    "Light Map View": light,
    "Dark Map View": dark,
    "Satellite Map View": satellite
  };

  // Create an overlayMaps variable to hold the marker layer:
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the tiles and layers specified above:
  var myMap = L.map("map", {
    center: [40.4637,-3.7492],
    zoom: 2,
    layers: [light, dark, satellite, earthquakes]
  });

  // Create a layer control and add it to the map itself:
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend for the map and position it in the appropriate place:
  // The code below is an adaptation of an example found at 'https://gis.stackexchange.com/questions/133630/adding-leaflet-legend'.
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magCategories = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magCategories.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColour(magCategories[i] + 1) + '"></i> ' + 
      + magCategories[i] + (magCategories[i + 1] ? ' - ' + magCategories[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}

