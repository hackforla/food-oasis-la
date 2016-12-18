function geocodeAddress(address, callback) {
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({'address': address}, function(results, status) {
if (status === google.maps.GeocoderStatus.OK) {

	var longitude = results[0].geometry.location.lng();
	var latitude  = results[0].geometry.location.lat();

	callback([longitude, latitude]);

} else {
	console.error('Geocode was not successful for the following reason: ' + status);
}
	});
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#answer-901144

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function findUserLocation() {
	var address = getParameterByName('address');

	if (address) {

// Add Los Angeles to the address
if (address.indexOf('Los Angeles') < 0) {
	address += ' Los Angeles';
}

geocodeAddress(address, moveMapToPosition);

	// Grab user's location on page-load
	} else if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(position) {

		// Set new starting location
		var myCoords = [position.coords.longitude, position.coords.latitude];
		console.log('current coords ' + myCoords);
		moveMapToPosition(myCoords);

		}, function() {
			console.error("Unable to retrieve your location");
		});
	}
}

function moveMapToPosition(position) {
	 map.setZoom(14);
	 map.panTo(position);

	var template = document.getElementById('you-are-here-template');
	if (template) {
var marker = document.createElement('div');
marker.innerHTML = template.innerHTML;

new mapboxgl.Marker(marker)
	.setLngLat(position)
	.addTo(map);
	}
}