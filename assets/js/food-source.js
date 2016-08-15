(function() {

	// Create the map
	mapboxgl.accessToken = 'pk.eyJ1IjoiZm9vZGRlc2VydHNsYSIsImEiOiJjaXByOXRscnMwNzY1Zm5ub3YwYTd5Z3dsIn0.DWgUhgW32pVkybKx7cWWiw';

	var map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/mapbox/light-v9',
		center: [FOOD_SOURCE.longitude, FOOD_SOURCE.latitude], // starting position
		zoom: 14 // starting zoom
	});

	// Add a zoom control
	map.addControl(new mapboxgl.Navigation({position: 'bottom-left'})); // position is optional

	// Add a marker at the location of the food source
	var template = document.getElementById('marker-template');
	if (template) {
		var marker = document.createElement('div');
		marker.innerHTML = template.innerHTML;

		new mapboxgl.Marker(marker)
			.setLngLat([FOOD_SOURCE.longitude, FOOD_SOURCE.latitude])
			.addTo(map);
	}

})();
