(function() {

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

	function createPopupElement(data) {

		var template = document.getElementById('popup-template');
		if (template) {
			var element = document.createElement('div');
			element.innerHTML = template.innerHTML;
			element.querySelector('.map-point-details').className +=
				' ' + data.category.toLowerCase().replace(' ', '-') + '-details'; // Example: farmers-market-details

			// Name
			var nameElement = element.querySelector('h3');
			var link = nameElement.querySelector('a');
			link.setAttribute('href', data.uri);
			link.innerText = data.name;

			// Category (Type)
			var typeElement = element.querySelector('.type');
			typeElement.innerText = data.category;

			// Address
			if (data.address_1) element.querySelector('.address').innerHTML = data.address_1;

			// Hours
			var hoursElement = element.querySelector('.hours');
			if (data.hours) {
				hoursElement.innerHTML = data.hours;
			} else {
				var h4 = element.querySelector('h4');
				h4.parentNode.removeChild(h4);

				hoursElement.parentNode.removeChild(hoursElement);
			}

			// Address
			if (data.distance) element.querySelector('.distance span').innerHTML = getDistanceForPresentation(data.distance);

			return element;
		}
	}


	(function() {

		function findUserLocation() {
			var address = getParameterByName('address');
			var foodSourcesList = document.querySelector('.location-list');

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

						//console.log('latitude: ' + latitude);
						//console.log('longitude: ' + longitude);

						sortByClosest(latitude, longitude, false);
						if (foodSourcesList) foodSourcesList.classList.remove('sorting');
						if (document.getElementById('location')) document.getElementById('location').innerHTML = 'Near <em>' + getParameterByName('address') + '</em>';

					} else {
						console.error('Geocode was not successful for the following reason: ' + status);
						sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
						if (foodSourcesList) foodSourcesList.classList.remove('sorting');
						if (document.getElementById('location')) document.getElementById('location').innerHTML = 'Near <em>Downtown Los Angeles</em>';
					}
				});

			// Else if automatic geolocation is available
			} else if ("geolocation" in navigator) {

				if (foodSourcesList) foodSourcesList.classList.add('sorting');
				navigator.geolocation.getCurrentPosition(function(position) {

					sortByClosest(position.coords.latitude, position.coords.longitude, true);
					if (foodSourcesList) foodSourcesList.classList.remove('sorting');
					if (document.getElementById('location')) document.getElementById('location').innerHTML = 'Near You';

				}, function() {
					console.error("Unable to retrieve your location");
					sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
					if (foodSourcesList) foodSourcesList.classList.remove('sorting');
					if (document.getElementById('location')) document.getElementById('location').innerHTML = 'Near <em>Downtown Los Angeles</em>';
				});
			} else {
				sortByClosest(LOS_ANGELES.latitude, LOS_ANGELES.longitude, false);
				if (foodSourcesList) foodSourcesList.classList.remove('sorting');
				if (document.getElementById('location')) document.getElementById('location').innerHTML = 'Near <em>Downtown Los Angeles</em>';
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
			// console.log("inside sortByClosest");
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
				list = list.filter(function(element) {
					return (element.category.toLowerCase().replace(' ', '-') === type);
				});
			}

			addMarkers(list, geolocated, latitude, longitude);
			addListItems(list);
		}

		// KUDOS: http://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position#answer-21297385
		function getDistanceInKilometers_PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
			lat1 = deg2rad(lat1);
			lat2 = deg2rad(lat2);
			lon1 = deg2rad(lon1);
			lon2 = deg2rad(lon2);
			var R = 6371; // km
			var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
			var y = (lat2-lat1);
			var d = Math.sqrt(x*x + y*y) * R;
			return d;
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

		findUserLocation();

	})();


	if ('L' in window) L.mapbox.accessToken = MAP_ACCESS_TOKEN;
	var map;
	if (document.getElementById('map')) {
		map = L.mapbox.map('map', 'mapbox.light', {
			zoomControl: false,
			scrollWheelZoom: false
		}).setView([LOS_ANGELES.latitude, LOS_ANGELES.longitude], 14);

		L.control.zoom({
			position:'topright'
		}).addTo(map);

		(function() {
			var template = document.getElementById('larger-map-template');
			if (template) {
				var div = document.createElement('div');
				div.innerHTML = template.innerHTML;
				var button = div.querySelector('button');
				//template.parentNode.insertBefore(div, template);
				function expandMap() {
					document.getElementById('map').className += ' expanded';
					map.invalidateSize(false);
					//div.parentNode.removeChild(div);
					map.scrollWheelZoom.enable();
				}
				button.addEventListener('click', expandMap, false);
				button.addEventListener('keypress', function(e) {
					if (e.keyCode === 32 || // spacebar
						e.keyCode === 13) { // enter
						expandMap();
					}
				}, false);
				document.getElementById('map').addEventListener('click', expandMap, false);
				// expandMap();
			}
		})();
	}

	// Define the icons
	var icons;
	if ('L' in window) {
		icons = {
			'Farmers Market': L.divIcon({
				// Specify a class name we can refer to in CSS.
				className: 'farmers-market-marker',
				// Set marker width and height
				iconSize: [43, 56],
				popupAnchor: [0, -28]
			}),
			'Community Garden': L.divIcon({
				// Specify a class name we can refer to in CSS.
				className: 'community-garden-marker',
				// Set marker width and height
				iconSize: [43, 56],
				popupAnchor: [0, -28]
			}),
			'Food Pantry': L.divIcon({
				// Specify a class name we can refer to in CSS.
				className: 'food-pantry-marker',
				// Set marker width and height
				iconSize: [43, 56],
				popupAnchor: [0, -28]
			})
		};
	}

	/*
	function addMarker(position) {
		var template = document.getElementById('marker-template');

		var icon = icons[location.category];
		var coordinates = [
			location.latitude,
			location.longitude
		];
		L.marker(coordinates, { icon: icon })
			.bindPopup(template.innerHTML)
			.addTo(map);

		return new mapboxgl.Marker(marker)
			.setLngLat(position)
			.addTo(map);
	}
	*/

	function addYouAreHere(coordinates) {
		var icon = L.divIcon({
			html: '<div class="you-are-here"><span>You are here</span></div>',
			// Set marker width and height
			iconSize: [0, 0],
			//iconAnchor: [0, 0]
		})

		return L.marker(coordinates, { icon: icon })
			.addTo(map);
	}

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

		if (map) {
			for (var index = start; index < locations.length && index < limit; index++) {
				(function(location) {
					var icon = icons[location.category];
					var coordinates = [
						location.latitude,
						location.longitude
					];
					var popup = L.popup({ maxWidth: INFINITY })
						.setContent(createPopupElement(location));

					L.marker(coordinates, { icon: icon })
						.bindPopup(popup)
						.addTo(map);
					bounds.push(coordinates);
				})(locations[index]);
			}
		}

		var limitTemplate = document.getElementById('limit-template');
		if (limitTemplate) {
			var div = document.createElement('div');
			div.innerHTML = limitTemplate.innerHTML;
			div.querySelector('.limit').textContent = limit;
			div.querySelector('.location').innerHTML = (geolocated) ? 'near you' : 'near <em>' + (getParameterByName('address') || 'Downtown Los Angeles') + '</em>';
			var address = getParameterByName('address') || '';
			if (address != '') address = 'address=' + address + '&';
			var type = getParameterByName('type') || '';
			if (type != '') type = 'type=' + type + '&';
			var link = div.querySelector('a');
			if (limit < locations.length) {
				link.href = '?' + address + type + 'limit=' + (limit * 2);
			} else {
				link.parentNode.removeChild(link);
			}
			limitTemplate.parentNode.insertBefore(div, limitTemplate);
		}

		//if (geolocated) {
			if (map) addYouAreHere([latitude, longitude]);
		//} else {
			//addMarker([latitude, longitude]);
		//}

		bounds.unshift([latitude, longitude]);

		bounds = bounds.slice(0, 5);

		if (map) {
			map.fitBounds(bounds);
			//map.panTo(new L.LatLng(latitude, longitude));
		}

		/*
		map.on('zoomend', function() {
			var currentZoom = map.getZoom();
			myMarker.setRadius(currentZoom);
		});
		*/
	}

	function createListItem(data) {

		var template = document.getElementById('list-item-template');
		if (template) {
			var element = document.createElement('li');
			element.innerHTML = template.innerHTML;
			element.className = data.category.toLowerCase().replace(' ', '-'); // Example: farmers-market

			// Name
			var nameElement = element.querySelector('h2');
			nameElement.textContent = data.name;

			var link = element.querySelector('a');
			link.setAttribute('href', data.uri);

			// Category (Type)
			var typeElement = element.querySelector('.type');
			typeElement.textContent = data.category;

			// Address
			if (data.address_1) element.querySelector('.address').innerHTML = data.address_1;

			// Hours
			var hoursElement = element.querySelector('.hours');
			if (data.hours) {
				hoursElement.innerHTML = data.hours;
			} else {
				var h3 = element.querySelector('h3');
				h3.parentNode.removeChild(h3);

				hoursElement.parentNode.removeChild(hoursElement);
			}

			// Address
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
		var list = document.querySelector('.location-list');
		if (list) {
			list.innerHTML = '';
			for (var index = start; index < sortedLocations.length && index < limit; index++) {
				list.appendChild(createListItem(sortedLocations[index]));
			}
		}
	}

	/*
	function addMoreListItems() {
		var limit = getParameterByName('limit');
		if (!limit) {
			limit = 10;
		}
		limit = Number(limit);
		var list = document.querySelector('.location-list');
		var items = list.querySelectorAll('li');
		limit += items.length;
		if (limit >= sortedLocations.length) limit = sortedLocations.length;
		if (list) {
			for (var index = items.length; index < sortedLocations.length && index < limit; index++) {
				list.appendChild(createListItem(sortedLocations[index]));
			}
		}
	}
	var nextPageLink = document.querySelector('.pagination a');
	if (nextPageLink) {
		nextPageLink.addEventListener('click', function(e) {
			addMoreListItems();
			e.preventDefault();
		}, false);
	}
	*/

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

	function persistTypeParameter(type) {
		if (!type) type = getParameterByName('type');

		var address = getParameterByName('address');
		var searchLink = document.querySelector('.search a[href]');
		if (!searchLink) return;
		var href = '/list';

		if (type) {
			/*
			var form = document.querySelector('form.find');
			var typeField = form.querySelector('input[name="type"]');
			if (!typeField) {
				typeField = document.createElement('input');
				typeField.type = 'hidden';
				typeField.name = 'type';
				form.appendChild(typeField);
			}
			typeField.value = type;
			*/

			var typeArray = type.split('|');

			// SHIM: Only persist the type if there’s only one, since the list page only supports one type at a time (or all types at once).
			if (typeArray.length === 1) {
				href = '/' + typeArray[0];
			}
		}
		if (address) {
			href += '?address=' + address;

			//var addressField = document.querySelector('input[name="address"]');
			//addressField.value = address;
		}
		searchLink.setAttribute('href', href);
	}

	persistTypeParameter();
	//addFilterButtons();

})();
