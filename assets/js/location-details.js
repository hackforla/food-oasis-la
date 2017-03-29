
(function() {
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


	// TODO…
	/*
	Loop through the list of hours
	For each day, check to see if it matches the current date
	If there’s a match
		If the store is open
			Show an open indicator inline and at the top of the page
		Else
			Show a closed indicator inline and at the top of the page
	*/

	var headerOpenNowShowing = false;
	function showOpenNowInHeader() {
		if (headerOpenNowShowing) return;
		var openTemplate = document.querySelector('.open-template');
		openTemplate.parentNode.insertAdjacentHTML('beforeend', openTemplate.innerHTML);
		headerOpenNowShowing = true;
	}

	(function() {
		var dtElements = document.querySelectorAll('dt[data-day]');
		var ddElements = document.querySelectorAll('dd[data-day]');

		for (var index = 0; index < dtElements.length; index++) {
			(function() {
				var dt = dtElements[index];
				var dd = ddElements[index];
				var data = {
					day: dd.getAttribute('data-day'),
					open: dd.getAttribute('data-open'),
					close: dd.getAttribute('data-close')
				};
				console.dir(data);
				if (isOpenNow(data)) {
					dt.classList.add('open');
					dd.classList.add('open');
					var notice = document.createElement('i');
					notice.textContent = 'Open Now';
					dd.appendChild(document.createTextNode(' '));
					dd.appendChild(notice);
					showOpenNowInHeader();
				}
			})();
		}
	})();



	/*
	// Show “Open Now” indicator in the list of hours

	var dt = document.querySelector('dt[data-day]');
	var dd = document.querySelector('dd[data-day]');
	if (dd) {
		if (isOpenNow()) {
			dt.classList.add('open');
			dd.classList.add('open');
			var notice = document.createElement('i');
			notice.textContent = 'Open Now';
			dd.appendChild(document.createTextNode(' '));
			dd.appendChild(notice);
		}
	}


	// Show “Open Now” indicator at the top of the page
	if (isOpenNow()) {
		var openTemplate = document.querySelector('.open-template');
		openTemplate.parentNode.insertAdjacentHTML('beforeend', openTemplate.innerHTML);
	}
	*/

})();


(function() {
	if (mapboxgl.supported()) {

	// Create the map
	mapboxgl.accessToken = 'pk.eyJ1IjoiZm9vZG9hc2lzbGEiLCJhIjoiY2l0ZjdudnN4MDhpYzJvbXlpb3IyOHg2OSJ9.POBdqXF5EIsGwfEzCm8Y3Q';

	var map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/mapbox/basic-v9',
		//style: 'mapbox://styles/mapbox/streets-v9',
		center: [FOOD_SOURCE.longitude, FOOD_SOURCE.latitude], // starting position
		scrollZoom: false,
		zoom: 14 // starting zoom
	});

	// Add a zoom control
	map.addControl(new mapboxgl.NavigationControl( { position: 'top-right' } )); // position is optional

	// Add a marker at the location of the food source
	var template = document.getElementById('marker-template');
	if (template) {
		var marker = document.createElement('div');
		marker.innerHTML = template.innerHTML;

		new mapboxgl.Marker(marker)
			.setLngLat([FOOD_SOURCE.longitude, FOOD_SOURCE.latitude])
			.addTo(map);
	}
	(function() {
		//template.parentNode.insertBefore(div, template);
		function expandMap() {
			document.getElementById('map').className += ' expanded';
			map.resize();
			//div.parentNode.removeChild(div);
			map.scrollZoom.enable();
		}
		document.getElementById('map').addEventListener('click', expandMap, false);
		// expandMap();
	})();

	} else {
		if (console && console.log) console.log('MapboxGL doesn’t appear to be supported in this web browser. Hiding the map…');
		document.getElementById('map').style.display = 'none';
	}
})();

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

	function findUserLocation(callback) {
		var address = getParameterByName('address');

		// If the user passed in an address, and if the Google Maps geocoder is available
		if (address && "google" in window) {

			// Add Los Angeles to the address
			if (address.indexOf('Los Angeles') < 0) {
				address += ' Los Angeles';
			}

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {

					var latitude  = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					callback({
						latitude: latitude,
						longitude: longitude
					});

				} else {
					console.error('Geocode was not successful for the following reason: ' + status);
				}
			});

		// Else if automatic geolocation is available
		} else if ("geolocation" in navigator) {

			navigator.geolocation.getCurrentPosition(function(position) {

				callback({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});

			}, function() {
				console.error("Unable to retrieve your location");
			});
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

	var INFINITY = 9999999;
	function getDistanceForPresentation(kilometers) {	
		if (kilometers === INFINITY) return 'unknown';

		var miles = kilometers / 1.609; // kilometers per mile
		miles = Math.round10(miles, -1); // Round to one decimal place
		return parseFloat(miles.toFixed(1));
	}

	var PAGE_PARAMETERS = {
		type   : getParameterByName('type'),
		address: getParameterByName('address'),
		deserts: getParameterByName('deserts'),
		open: getParameterByName('open')
	};

	// Distance
	if (PAGE_PARAMETERS.type || PAGE_PARAMETERS.address || PAGE_PARAMETERS.deserts || PAGE_PARAMETERS.open) { // If the user came from the search page
	var distance;
	findUserLocation(function(userLocation) {
		if (FOOD_SOURCE.latitude != null && FOOD_SOURCE.latitude != '' && userLocation && userLocation.latitude && userLocation.longitude) {
			distance = getDistanceInKilometers_Haversine(userLocation.latitude, userLocation.longitude, parseFloat(FOOD_SOURCE.latitude), parseFloat(FOOD_SOURCE.longitude));
		} else {
			distance = INFINITY; // infinity
		}

		if (distance && distance != INFINITY) {
			var distanceTemplate = document.querySelector('.distance-template');
			distanceTemplate.parentNode.insertAdjacentHTML('beforeend', distanceTemplate.innerHTML);
			distanceTemplate.parentNode.querySelector('.distance span').innerHTML = getDistanceForPresentation(distance);
		}
	});
	}

	function updateLink(link) {
		var params = [];
		if (PAGE_PARAMETERS.type) params.push('type=' + PAGE_PARAMETERS.type);
		if (PAGE_PARAMETERS.address) params.push('address=' + PAGE_PARAMETERS.address);
		if (PAGE_PARAMETERS.deserts) params.push('deserts=' + PAGE_PARAMETERS.deserts);
		if (PAGE_PARAMETERS.open) params.push('open=' + PAGE_PARAMETERS.open);

		var queryString = params.join('&');
		link.setAttribute('href', link.getAttribute('href') + '?' + queryString);
	}

	if (PAGE_PARAMETERS.type || PAGE_PARAMETERS.address || PAGE_PARAMETERS.deserts || PAGE_PARAMETERS.open) {
		var link = document.getElementById('back-link');
		if (link) {
			updateLink(link);
			link.querySelector('span').textContent = 'Back to All Results';
		}
	}

})();
