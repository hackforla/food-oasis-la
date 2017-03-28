// deselects marker if blank on map is clicked
var mapContainer = document.getElementById('map');
mapContainer.addEventListener('click', function(e){
	var target = e.target.getAttribute('class');
	if (target === 'mapboxgl-canvas') {
		var activeMarker = document.getElementsByClassName("active")[0]
		activeMarker.classList.remove('active')

		var summary = document.getElementById('map-location-summary');
		summary.innerHTML = '';

		document.body.classList.remove('has-map-location-summary');
	}
});

(function() {
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

	var LOS_ANGELES = {
		latitude: 34.052234,
		longitude: -118.243685
	};

	var INFINITY = 9999999;
	function getDistanceForPresentation(kilometers) {
		if (kilometers === INFINITY) return 'unknown';

		var miles = kilometers / 1.609; // kilometers per mile
		miles = Math.round10(miles, -1); // Round to one decimal place
		return parseFloat(miles.toFixed(1));
	}


	(function() {

		function findUserLocation() {
			var address = getParameterByName('address');
			var foodSourcesList = document.querySelector('ul.location-list');

			// If the user passed in an address, and if the Google Maps geocoder is available
			if (address && "google" in window) {

				// Add Los Angeles to the address
				if (address.indexOf('Los Angeles') < 0) {
					address += ' Los Angeles';
				}

				if (foodSourcesList) foodSourcesList.classList.add('sorting');

				var geocoder = new google.maps.Geocoder();

				geocoder.geocode({'address': address}, function(results, status) {
					if (status === google.maps.GeocoderStatus.OK) {

						var latitude  = results[0].geometry.location.lat();
						var longitude = results[0].geometry.location.lng();

						sortByClosest(latitude, longitude, false);
						if (foodSourcesList) foodSourcesList.classList.remove('sorting');
						if (document.getElementById('search-location')) document.getElementById('search-location').textContent = getParameterByName('address');

					} else {
						console.error('Geocode was not successful for the following reason: ' + status);
						sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
						if (foodSourcesList) foodSourcesList.classList.remove('sorting');
						if (document.getElementById('search-location')) document.getElementById('search-location').textContent = 'Downtown Los Angeles';
					}
				});

			// Else if automatic geolocation is available
		} else if ("geolocation" in navigator) {

			if (foodSourcesList) foodSourcesList.classList.add('sorting');
			navigator.geolocation.getCurrentPosition(function(position) {

				sortByClosest(position.coords.latitude, position.coords.longitude, true);
				if (foodSourcesList) foodSourcesList.classList.remove('sorting');
				if (document.getElementById('search-location')) document.getElementById('search-location').textContent = 'you';

			}, function() {
				console.error("Unable to retrieve your location");
				sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
				if (foodSourcesList) foodSourcesList.classList.remove('sorting');
				if (document.getElementById('search-location')) document.getElementById('search-location').textContent = 'Downtown Los Angeles';
			});
		} else {
			sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
			if (foodSourcesList) foodSourcesList.classList.remove('sorting');
			if (document.getElementById('search-location')) document.getElementById('search-location').textContent = 'Downtown Los Angeles';
		}
	}

		// http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript#12830454#answer-25075575
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding
		(function() {
			/**
			 * Decimal adjustment of a number.
			 *
			 * @param {String}  type  The type of adjustment.
			 * @param {Number}  value The number.
			 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
			 * @returns {Number} The adjusted value.
			 */
			 function decimalAdjust(type, value, exp) {
				// If the exp is undefined or zero...
				if (typeof exp === 'undefined' || +exp === 0) {
					return Math[type](value);
				}
				value = +value;
				exp = +exp;
				// If the value is not a number or the exp is not an integer...
				if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
					return NaN;
				}
				// Shift
				value = value.toString().split('e');
				value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
				// Shift back
				value = value.toString().split('e');
				return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
			}

			// Decimal round
			if (!Math.round10) {
				Math.round10 = function(value, exp) {
					return decimalAdjust('round', value, exp);
				};
			}
			// Decimal floor
			if (!Math.floor10) {
				Math.floor10 = function(value, exp) {
					return decimalAdjust('floor', value, exp);
				};
			}
			// Decimal ceil
			if (!Math.ceil10) {
				Math.ceil10 = function(value, exp) {
					return decimalAdjust('ceil', value, exp);
				};
			}
		})();

		function sortByClosest(latitude, longitude, geolocated) {
			var list = [];
			var nextLatitude, nextLongitude, dif;
			for (index = 0; index < locations.length; index++) {
				nextLatitude  = locations[ index ].latitude;
				nextLongitude = locations[ index ].longitude;
				if (nextLatitude != null && nextLatitude != '') {
					dif = getDistanceInKilometers_Haversine(latitude, longitude, parseFloat(nextLatitude), parseFloat(nextLongitude));
				} else {
					dif = INFINITY; // infinity
				}
				locations[index].distance = dif;
				list.push(locations[index]);
			}
			list.sort(function(a, b) {
				if (a.distance > b.distance) {
					return 1;
				}
				if (a.distance < b.distance) {
					return -1;
				}
				// a must be equal to b
				return 0;
			});

			var type = getParameterByName('type');
			if (type) {
				var types = type.split('|');
				list = list.filter(function(item) {
					for (var index = 0; index < types.length; index++) {
						if (item.category.toLowerCase().replace(' ', '-') === types[index]) {
							return true;
						}
					}
					return false;
				});
			}

			var open = getParameterByName('open');
			if (open) {
				list = list.filter(function(item) {
					var open = false;
					for (var index = 0; index < item.hours.length; index++) {
						if (isOpenNow(item.hours[index])) {
							open = true;
						}
					}

					return open;
				});
			}

			addMarkers(list, geolocated, latitude, longitude);
			addListItems(list);
		}

		// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula/27943#answer-27943
		function getDistanceInKilometers_Haversine(lat1, lon1, lat2, lon2) {
			var R = 6371; // Radius of the earth in km
			var dLat = deg2rad(lat2-lat1);
			var dLon = deg2rad(lon2-lon1);
			var a =
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
			Math.sin(dLon/2) * Math.sin(dLon/2)
			;
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = R * c; // Distance in km
			return d;
		}

		// Convert Degress to Radians
		function deg2rad(deg) {
			return deg * (Math.PI/180)
		}

		findUserLocation();

	})();


	if ('mapboxgl' in window) mapboxgl.accessToken = MAP_ACCESS_TOKEN;
	var map;
	if (document.getElementById('map') && 'mapboxgl' in window && mapboxgl.supported()) {

		/*
		map = L.mapbox.map('map', 'mapbox.light', {
			zoomControl: false//,
			//scrollWheelZoom: false
		}).setView([LOS_ANGELES.latitude, LOS_ANGELES.longitude], 14);
*/
map = new mapboxgl.Map({
			container: 'map', // container id
			style: 'mapbox://styles/mapbox/basic-v9',
			//style: 'mapbox://styles/mapbox/streets-v9',
			maxBounds: MAP_BOUNDS
		});

		/*
		L.control.zoom({
			position:'topright'
		}).addTo(map);
*/

map.on('load', function() {

			// Add a zoom control
			map.addControl(new mapboxgl.NavigationControl( { position: 'top-right' } )); // position is optional

			if (getParameterByName('deserts') === '1') {

				// Draw food desert census tracts
				map.addSource('Food Deserts', {
					'type': 'vector',
					'url': 'mapbox://foodoasisla.d040onrj'
				});

				map.addLayer({
					'id': 'Food Deserts',
					'type': 'fill',
					'source': 'Food Deserts',
					'layout': {
						'visibility': 'visible'
					},
					'paint': {
						'fill-color': '#FF0000',
						'fill-opacity': 0.1
					},
					'filter': ["==", "LI LA De_4", "1"],
					'source-layer': 'USDA_Food_Desert_Tracts_2010-65gavx'
				});
			}
		});
}

	// Define the icons
	var markerOptions = {
		'Farmers Market': {
			// Specify a class name we can refer to in CSS.
			className: 'farmers-market-marker',
			// Set marker width and height
			iconSize: [30, 46],
			iconAnchor: [15, 40],
			popupAnchor: [0, -23]
		},
		'Supermarket': {
			// Specify a class name we can refer to in CSS.
			className: 'farmers-market-marker',
			// Set marker width and height
			iconSize: [30, 46],
			iconAnchor: [15, 40],
			popupAnchor: [0, -23]
		},
		'Community Garden': {
			// Specify a class name we can refer to in CSS.
			className: 'community-garden-marker',
			// Set marker width and height
			iconSize: [30, 46],
			iconAnchor: [15, 40],
			popupAnchor: [0, -23]
		},
		'Food Pantry': {
			// Specify a class name we can refer to in CSS.
			className: 'food-pantry-marker',
			// Set marker width and height
			iconSize: [30, 46],
			iconAnchor: [15, 40],
			popupAnchor: [0, -23]
		}
	};

	var activeMarkerOptions = {
		'Farmers Market': {
			// Specify a class name we can refer to in CSS.
			className: 'farmers-market-marker-active',
			// Set marker width and height
			iconSize: [42, 70],
			iconAnchor: [21, 70],
			popupAnchor: [0, -35]
		},
		'Supermarket': {
			// Specify a class name we can refer to in CSS.
			className: 'farmers-market-marker-active',
			// Set marker width and height
			iconSize: [42, 70],
			iconAnchor: [21, 70],
			popupAnchor: [0, -35]
		},
		'Community Garden': {
			// Specify a class name we can refer to in CSS.
			className: 'community-garden-marker-active',
			// Set marker width and height
			iconSize: [42, 70],
			iconAnchor: [21, 70],
			popupAnchor: [0, -35]
		},
		'Food Pantry': {
			// Specify a class name we can refer to in CSS.
			className: 'food-pantry-marker-active',
			// Set marker width and height
			iconSize: [42, 70],
			iconAnchor: [21, 70],
			popupAnchor: [0, -35]
		}
	};

	function addYouAreHere(coordinates) {
		/*
		var icon = L.divIcon({
			html: '<div class="you-are-here"><span>You are here</span></div>',
			// Set marker width and height
			iconSize: [0, 0],
			//iconAnchor: [0, 0]
		})

		return L.marker(coordinates, { icon: icon })
			.addTo(map);
			*/

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

		var currentMarker;
		function addMarkers(locations, geolocated, latitude, longitude) {
			var limit = getParameterByName('limit') || itemsPerPage;
			if (!limit) {
				limit = 10;
			}
			limit = Number(limit);
			var start = window.listOffset || 0;
			limit += start;
			if (limit >= locations.length) limit = locations.length;
			var bounds = [];
			var tooltips = [];

			if (map) {
				for (var index = start; index < locations.length && index < limit; index++) {
					(function(location) {
					/*
					var icon = icons[location.category];
					var coordinates = [
						location.latitude,
						location.longitude
					];

					//var popup = L.popup({ maxWidth: INFINITY })
					//	.setContent(createListItem(location, 'div'));

					var marker = L.marker(coordinates, { icon: icon });

					//marker.bindPopup(popup);
					var tooltip = marker.bindTooltip(location.name, {
						direction: 'center',
						offset: [0, -20],
						permanent: true,
						interactive: true
					});
					marker.addTo(map);
					tooltip.addTo(map);
					tooltip.closeTooltip();
					*/

					var options = markerOptions[location.category];
					var coordinates = [
					location.longitude,
					location.latitude
					];

					var marker = createMarker(options, location);

					new mapboxgl.Marker(marker)
					.setLngLat(coordinates)
					.addTo(map);

					function showLocationSummary() {
						var item = createListItem(location, 'div');
						var summary = document.getElementById('map-location-summary');
						summary.innerHTML = '';
						summary.appendChild(item);
						document.body.classList.add('has-map-location-summary');
						/*
						setTimeout(function() {
							map.invalidateSize();
							bounds.push(coordinates);
							map.fitBounds(bounds);
						}, 100);
*/
}

marker.addEventListener('click', function(e) {
						//resetMarkers();
						//var icon = activeIcons[location.category];
						//marker.setIcon(icon);
						if (currentMarker) currentMarker.classList.remove('active');
						currentMarker = marker;
						currentMarker.classList.add('active');
						showLocationSummary();
					});

markerResetMethods.push(function() {
	var icon = icons[location.category];
	marker.setIcon(icon);
});

bounds.push(coordinates);
					//tooltips.push(tooltip);
				})(locations[index]);
			}

			function updateMarkerLabels() {
				if (map.getZoom() > 14) { // Zoomed In
					document.body.classList.remove('hidden-marker-labels');
				} else { // Zoomed Out
					document.body.classList.add('hidden-marker-labels');
				}
			}

			// KUDOS: http://stackoverflow.com/questions/27820338/how-do-i-show-a-label-beyond-a-certain-zoom-level-in-leaflet#answer-27822424
			/*
			(function() {

				var visible;

				function updateTooltips(doShow) {
					// Check zoom level
					if (map.getZoom() > 14 || doShow === true) {
						// Check if not already shown
						if (!visible) {

							// Loop over layers
							for (var index = 0; index < tooltips.length; index++) {
								// Show label
								tooltips[index].openTooltip();
							};
							// Set visibility flag
							visible = true;
						}
					} else {
						// Check if not already hidden
						if (visible) {
							// Loop over layers
							for (var index = 0; index < tooltips.length; index++) {
								// Hide label
								tooltips[index].closeTooltip();
							};
							// Set visibility flag
							visible = false;
						}
					}
				}

			})();
*/

setTimeout(function() {
	updateMarkerLabels();
}, 100);

map.on('zoomend', updateMarkerLabels);
}

if (map) addYouAreHere([longitude, latitude]);

bounds.unshift([longitude, latitude]);

if (map) {
	map.setZoom(15);
	map.setCenter([longitude, latitude]);

	var mapLngLatBounds = new mapboxgl.LngLatBounds();

	bounds.forEach(function(coordinates) {
		mapLngLatBounds.extend(coordinates);
	});

	map.fitBounds(mapLngLatBounds, { padding: 20 });
}

		/*
		map.on('zoomend', function() {
			var currentZoom = map.getZoom();
			myMarker.setRadius(currentZoom);
		});
*/
}


var DAYS_OF_WEEK = [
'Sun',
'Mon',
'Tue',
'Wed',
'Thu',
'Fri',
'Sat'
];
	function getSeconds(timeString) { // Example: 1430 ==> 14.5 hours ==> 52,200 seconds
		var hours   = Number(timeString.substring(0, timeString.length - 2));
		var minutes = Number(timeString.substring(timeString.length - 2));
		return (hours * 60 * 60) + (minutes * 60);
	}
	function isOpenNow(data) {
		if (data.day && data.open && data.close) {

			var now = new Date();
			var pacificTime = (now.toString().indexOf('(PDT)') >= 0) || (now.toString().indexOf('(PST)') >= 0);

			var time = now.toTimeString();
			var nowSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();

			if (pacificTime &&
				DAYS_OF_WEEK[now.getDay()] === data.day &&
				nowSeconds > getSeconds(data.open) &&
				nowSeconds < getSeconds(data.close) ) {
				return true;
		}

			// TBD: Should we show a special notice if it’s opening soon or closing soon?
		}
		return false;
	}
	function createListItem(data, containerTagName) {

		var template = document.getElementById('list-item-template');
		if (template) {
			var element = document.createElement(containerTagName);
			var category = data.category.toLowerCase().replace(' ', '-'); // Example: farmers-market
			element.innerHTML = template.innerHTML;
			element.className = category;

			// Name
			var nameElement = element.querySelector('h2');
			nameElement.textContent = data.name;

			var params = [];
			if (PAGE_PARAMETERS.type) params.push('type=' + PAGE_PARAMETERS.type);
			if (PAGE_PARAMETERS.address) params.push('address=' + PAGE_PARAMETERS.address);
			if (PAGE_PARAMETERS.deserts) params.push('deserts=' + PAGE_PARAMETERS.deserts);
			if (PAGE_PARAMETERS.open) params.push('open=' + PAGE_PARAMETERS.open);

			var queryString = params.join('&');

			var link = element.querySelector('a');
			link.setAttribute('href', data.uri + '?' + queryString);

			// Category (Type)
			var typeElement = element.querySelector('.type');
			typeElement.textContent = data.category;
			var img = element.querySelector('img');
			img.src = "/assets/images/home/" + category + ".svg"; // SHIM: Should we handle this in the CSS instead?

			// Address
			if (data.address_1) element.querySelector('.address').innerHTML = data.address_1;

			// Open Now
			var open = false;
			for (var index = 0; index < data.hours.length; index++) {
				if (isOpenNow(data.hours[index])) {
					open = true;
				}
			}
			if (!open) {
				var openNowElement = element.querySelector('.open');
				openNowElement.parentNode.removeChild(openNowElement);
			}

			// Distance
			if (data.distance) element.querySelector('.distance span').innerHTML = getDistanceForPresentation(data.distance);

			return element;
		}
	}

	var sortedLocations;
	function addListItems(locations) {
		sortedLocations = locations;
		var limit = getParameterByName('limit') || itemsPerPage;
		if (!limit) {
			limit = 10;
		}
		limit = Number(limit);
		var start = window.listOffset || 0;
		limit += start;
		if (limit >= sortedLocations.length) limit = locations.length;
		var list = document.querySelector('ul.location-list');
		if (list) {
			list.innerHTML = '';
			for (var index = start; index < sortedLocations.length && index < limit; index++) {
				list.appendChild(createListItem(sortedLocations[index], 'li'));
			}
		}

		if (sortedLocations.length < 1) {
			var template = document.getElementById('no-results-template');
			var map = document.getElementById('map');
			if (template && map) {
				var div = document.createElement('div');
				div.innerHTML = template.innerHTML;
				map.parentNode.insertBefore(div, map);
			}
		}
	}

})();

// Toggle between the map and list views
(function() {
	if (mapboxgl.supported()) {

		var views = document.getElementById('search-views');
		var template = document.getElementById('search-views-template');
		views.insertAdjacentHTML('beforeend', template.innerHTML);

		var mapButton = document.getElementById('map-button');
		var listButton = document.getElementById('list-button');

		listButton.style.display = "block";

		document.body.classList.add('only-map');
		document.body.classList.remove('only-list');

		mapButton.addEventListener('click', function(e) {
			mapButton.style.display = "none";
			listButton.style.display = "block";

			document.body.classList.add('only-map');
			document.body.classList.remove('only-list');

			e.preventDefault();
		}, false);

		listButton.addEventListener('click', function(e) {
			mapButton.style.display = "block";
			listButton.style.display = "none";

			document.body.classList.remove('only-map');
			document.body.classList.add('only-list');

			e.preventDefault();
		}, false);
	} else {
		if (console && console.log) console.log('MapboxGL doesn’t appear to be supported in this web browser. Showing the list instead…');
		document.body.classList.add('only-list');
	}
})();

