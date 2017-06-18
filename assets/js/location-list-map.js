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

			map.on('dragend', showSearchThisArea);
			//map.on('zoomend', showSearchThisArea);
		}
	}

	var searchThisArea;
	function addSearchThisArea() {
		var template = document.getElementById('search-this-area-template');

		searchThisArea = document.createElement('div');
		searchThisArea.innerHTML = template.innerHTML;

		searchThisArea.addEventListener('click', function(e) {
			updateMarkers();
			hideSearchThisArea();
			hideLocationSummary();
			e.preventDefault();
			document.querySelector('main').scrollTo(0, 0);
		}, false);

		var mapContainer = document.getElementById('map');
		mapContainer.parentNode.insertBefore(searchThisArea, mapContainer);
	}

	function showSearchThisArea() {
		//if (!document.body.classList.contains('only-map')) return;
		if (!searchThisArea) addSearchThisArea();
		document.body.classList.add('has-search-this-area');
	}

	function hideSearchThisArea() {
		document.body.classList.remove('has-search-this-area');
	}

	var centerMarker;
	function updateMarkers() {
		var center = map.getCenter().toArray();
		var longitude = center[0];
		var latitude  = center[1];

		/*
		var maxZoom = 14;
		var minZoom = 7.5;
		var zoomLevels = maxZoom - minZoom;
		itemsPerPage = (locations.length / zoomLevels) * (zoomLevels - (map.getZoom() >= zoomLevels + 1 ? map.getZoom() - zoomLevels : 1));
		itemsPerPage = Math.round(itemsPerPage);
		if (map.getZoom() > maxZoom) itemsPerPage = 20;
		if (itemsPerPage < 20) itemsPerPage = 20;
		if (itemsPerPage > 50) itemsPerPage = 50;
		*/
		// console.log('map.getZoom(): ' + map.getZoom());
		// console.log('itemsPerPage: ' + itemsPerPage);

		var userLocation = window.oasis.getLastUserLocation();

		if (!userLocation) return;

		var list = window.oasis.sortByClosest(latitude, longitude, userLocation.latitude, userLocation.longitude);

		removeAllMarkers();

		window.oasis.addMarkers(list);
		window.oasis.addListItems(list);

		/*
		var coordinates = [longitude, latitude];
		if (!centerMarker) {
			var template = document.getElementById('you-are-here-template');

			var marker = document.createElement('div');
			marker.innerHTML = template.innerHTML;
			centerMarker = new mapboxgl.Marker(marker);
			centerMarker.setLngLat(coordinates).addTo(map);
		} else {
			centerMarker.setLngLat(coordinates);
		}
		*/

		//hideLocationSummary();
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

	function showLocationSummary(location, simulated) {
		var item = window.oasis.createListItem(location, 'div', true);
		var summary = document.getElementById('map-location-summary');
		summary.innerHTML = '';
		summary.appendChild(item);
		document.body.classList.add('has-map-location-summary');
		map.resize();
		document.querySelector('.location-summary-container').scrollTo(0, 0);

		// SHIM: Center the marker and zoom in
		if (simulated) {
			// map.setCenter([location.longitude, location.latitude]);
			// map.setZoom(14);
			map.flyTo({ center: [location.longitude, location.latitude] });
		}
	}

	function hideLocationSummary() {
		if (currentMarker) currentMarker.classList.remove('active')

		var summary = document.getElementById('map-location-summary');
		summary.innerHTML = '';

		document.body.classList.remove('has-map-location-summary');
		map.resize();
	}

	/*
	function handleMapPress() {
		var mapContainer = document.getElementById('map');
		mapContainer.addEventListener('click', function(e) {
			var target = e.target;
			if (target.getAttribute('class') === 'mapboxgl-canvas') {
				hideLocationSummary();
				//window.oasis.showMap();
			}
		});
	}
	*/

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
			var simulated = (e.clientX === 0 && e.clientY === 0); // This event was triggered by an element in the list, and not an actual click on the marker.
			updateCurrentMarker(marker);
			showLocationSummary(location, simulated);
		});

		markerResetMethods.push(function() {
			var icon = icons[location.category];
			marker.setIcon(icon);
		});

		markers.push(marker);

		marker._data = location;

		return coordinates;
	}
	function removeAllMarkers() {
		for (var index = 0; index < markers.length; index++) {
			markers[index].remove();
		}
	}

	var currentMarker;
	var initializingMarkers = true;
	var markers;
	function addMarkers(locations, userLocation) {
		if (!map) return;

		markers = [];

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

		if (userLocation && userLocation.latitude && userLocation.longitude) {
			// Add a “You are here” marker
			var coordinates = [userLocation.longitude, userLocation.latitude];
			addYouAreHere(coordinates);
			bounds.unshift(coordinates);
		}

		// Increase the size of the viewport to fit the markers
		if (initializingMarkers) fitMarkers(bounds);

		// Show the marker labels
		setTimeout(function() {
			updateMarkerLabels();
		}, 1000);
		if (initializingMarkers) map.on('zoomend', updateMarkerLabels);

		// Deselect the current marker if the map is pressed
		if (initializingMarkers) {
			//handleMapPress();
			var backNav = document.querySelector('.back-nav a');
			if (backNav) backNav.addEventListener('click', function(e) {
				hideLocationSummary();
				//window.oasis.showMap();

				// Scroll to the top of the page, since the page content has changed.
				window.scrollTo(0, 0);
				e.preventDefault();

			}, false);
		}

		initializingMarkers = false;
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

	function simulateMapPointClick(data) {
		for (var index = 0; index < markers.length; index++) {
			if (markers[index]._data.name === data.name) {
				markers[index].click();
				return true;
			}
		}
	}

	window.oasis.createMap = createMap;
	window.oasis.addMarkers = addMarkers;
	window.oasis.hideLocationSummary = hideLocationSummary;
	window.oasis.simulateMapPointClick = simulateMapPointClick;
})();
