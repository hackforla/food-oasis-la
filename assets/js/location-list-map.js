window.oasis = window.oasis || {};

(function() {

	var map;
	function createMap() {

		if (document.getElementById('map') && 'mapboxgl' in window && mapboxgl.supported()) {

			mapboxgl.accessToken = MAP_ACCESS_TOKEN;

			var container = document.getElementById('map');
			container.classList.add('active');

			map = new mapboxgl.Map({
				container: container,
				style: MAP_STYLE,
				maxBounds: MAP_BOUNDS
			});

			map.on('load', function() {

				// Add a zoom control
				map.addControl(new mapboxgl.NavigationControl( { position: 'top-right' } )); // position is optional

				// Draw food desert census tracts
				if (window.oasis.getParameterByName('deserts') === '1') {
					map.addSource('Food Deserts', FOOD_DESERTS_SOURCE);
					map.addLayer(FOOD_DESERTS_LAYER);
				}
			});
		}
	}

	function addYouAreHere(coordinates) {

		var template = document.getElementById('you-are-here-template');

		var marker = document.createElement('div');
		marker.innerHTML = template.innerHTML;

		return new mapboxgl.Marker(marker)
		.setLngLat(coordinates)
		.addTo(map);
	}

	var markerResetMethods = [];
	function resetMarkers() {
		for (var index = 0; index < markerResetMethods.length; index++) {
			markerResetMethods[index]();
		}
	}

	function createMarker(options, data) {
		var marker = document.createElement('div');
		marker.className = 'marker ' + options.className;
		var span = document.createElement('span');
		span.textContent = data.name;
		span.className = 'marker-label';
		marker.appendChild(span);
		return marker;
	}

	function updateMarkerLabels() {
		if (map.getZoom() > 14) { // Zoomed In
			document.body.classList.remove('hidden-marker-labels');
		} else { // Zoomed Out
			document.body.classList.add('hidden-marker-labels');
		}
	}

	function showLocationSummary(location) {
		var item = window.oasis.createListItem(location, 'div');
		var summary = document.getElementById('map-location-summary');
		summary.innerHTML = '';
		summary.appendChild(item);
		document.body.classList.add('has-map-location-summary');
	}

	function updateCurrentMarker(newMarker) {
		if (currentMarker) currentMarker.classList.remove('active');
		currentMarker = newMarker;
		currentMarker.classList.add('active');
	}

	function addMarker(location, coordinates) {
		var coordinates = [
			location.longitude,
			location.latitude
		];

		var options = MARKER_OPTIONS[location.category];

		if (!options) {
			options = {
				// Specify a class name we can refer to in CSS.
				className: '',
				// Set marker width and height
				iconSize: [30, 46],
				iconAnchor: [15, 40],
				popupAnchor: [0, -23]
			}
		}

		var marker = createMarker(options, location);

		new mapboxgl.Marker(marker)
			.setLngLat(coordinates)
			.addTo(map);

		marker.addEventListener('click', function(e) {
			updateCurrentMarker(marker);
			showLocationSummary(location);
		});

		markerResetMethods.push(function() {
			var icon = icons[location.category];
			marker.setIcon(icon);
		});

		return coordinates;
	}

	var currentMarker;

	function addMarkers(locations, geolocated, latitude, longitude) {
		if (!map) return;

		var limit = window.oasis.getParameterByName('limit') || itemsPerPage;
		if (!limit) {
			limit = 10;
		}
		limit = Number(limit);
		var start = window.listOffset || 0;
		limit += start;
		if (limit >= locations.length) limit = locations.length;
		var bounds = [];

		document.body.classList.add('hidden-marker-labels');

		// Loop through the locations
		for (var index = start; index < locations.length && index < limit; index++) {

			// Add a marker
			var coordinates = addMarker(locations[index]);

			bounds.push(coordinates);
		}

		// Add a “You are here” marker
		var coordinates = [longitude, latitude];
		addYouAreHere(coordinates);
		bounds.unshift(coordinates);

		// Increase the size of the viewport to fit the markers
		fitMarkers(bounds);

		// Show the marker labels
		setTimeout(function() {
			updateMarkerLabels();
		}, 1000);
		map.on('zoomend', updateMarkerLabels);

		// Deselect the current marker if the map is pressed
		handleMapPress();
	}

	function fitMarkers(bounds) {

		map.setZoom(15);

		var mapLngLatBounds = new mapboxgl.LngLatBounds();

		var limit = 10;
		for (var index = 0; index < limit && index < bounds.length; index++) {
			mapLngLatBounds.extend(bounds[index]);
		}

		map.fitBounds(mapLngLatBounds, { padding: 10, easing: function() { return 1; } });
		/*
		setTimeout(function() {
			map.setCenter([longitude, latitude]);
		}, 100);
		*/
	}

	function handleMapPress() {
		var mapContainer = document.getElementById('map');
		mapContainer.addEventListener('click', function(e){
			var target = e.target.getAttribute('class');
			if (target === 'mapboxgl-canvas') {
				if (currentMarker) currentMarker.classList.remove('active')

				var summary = document.getElementById('map-location-summary');
				summary.innerHTML = '';

				document.body.classList.remove('has-map-location-summary');
			}
		});
	}

	window.oasis.createMap = createMap;
	window.oasis.addMarkers = addMarkers;
})();
