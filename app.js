$(document).ready(function() {
  $("button").click(function(){
    console.log("hello world");
  });
  $.ajax({

    // The URL for the request
    url: "https://data.lacity.org/resource/ngkp-kqkn.json?$where=within_circle(location_1, 34.17, -118.35, 1000)",

    app_token:"kXBjaxcjq9Cb7BwSKch6iVdcm",

    // The data to send (will be converted to a query string)

    // Whether this is a POST or GET request
    type: "GET",

    // The type of data we expect back
    dataType : "json",
})
  // Code to run if the request succeeds (is done);
  // The response is passed to the function
  .done(function( json ) {
    for(var i = 0; i < json.length; i++){
      console.log(json[i]["location_1"]["coordinates"]);
    }

     // $( "<h1>" ).text( json.title ).appendTo( "body" );
     // $( "<div class=\"content\">").html( json.html ).appendTo( "body" );
  });
});

L.mapbox.accessToken = 'pk.eyJ1IjoicXVpcGNvZGUiLCJhIjoiY2lvbHVnb25kMDAwMXVhbHlzanpua3ZjZiJ9.KtezPL2kFNItzTUUajYiug';
var map = L.mapbox.map('map-one', 'mapbox.streets')
    .setView([34.0522,-118.2437], 14);

var featureLayer = L.mapbox.featureLayer()
    .loadURL('https://data.lacity.org/resource/ngkp-kqkn.geojson')
    .addTo(map);

// L.mapbox.scrollZoom.disable();
map.scrollWheelZoom.disable();

