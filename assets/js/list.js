(function() {

	var foodSourcesList = document.querySelector('.food-source-list');
	// console.log("food sources children", foodSourcesList.children);

	var foodSources = foodSourcesList.querySelectorAll('li');

	function findUserLocation() {
		var address = getParameterByName('address');

		// If the user passed in an address
		if (address) {
			if (document.getElementById('location')) document.getElementById('location').innerHTML = 'near <em>' + address + '</em>';

			// Add Los Angeles to the address
			if (address.indexOf('Los Angeles') < 0) {
				address += ' Los Angeles';
			}

			foodSourcesList.classList.add('sorting');

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {

					var latitude  = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					//console.log('latitude: ' + latitude);
					//console.log('longitude: ' + longitude);

					sortByClosest(latitude, longitude);

				} else {
					foodSourcesList.classList.remove('sorting');
					console.error('Geocode was not successful for the following reason: ' + status);
				}
			});

		// Else if automatic geolocation is available
		} else if ("geolocation" in navigator) {

			foodSourcesList.classList.add('sorting');
			navigator.geolocation.getCurrentPosition(function(position) {

				sortByClosest(position.coords.latitude, position.coords.longitude);
				if (document.getElementById('location')) document.getElementById('location').innerHTML = 'near you';

			}, function() {
				foodSourcesList.classList.remove('sorting');
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

	function addDistance(element, distance) {	
		var miles = distance / 1.609; // kilometers per mile
		miles = Math.round10(miles, -1); // Round to one decimal place
		template = element.querySelector('.distance-template');
		if (template) {
			var container = document.createElement('div');
			container.innerHTML = template.innerHTML;
			var valueElement = container.querySelector('.distance span');
			valueElement.innerHTML = distance === INFINITY ? 'unknown' : parseFloat(miles.toFixed(1));
			template.parentNode.insertAdjacentHTML('beforeend', container.innerHTML);
		}
	}

	var INFINITY = 9999999;
	function sortByClosest(latitude, longitude) {
		// console.log("inside sortByClosest");
		var list = [];
		var nextLatitude, nextLongitude, dif;
		for (index = 0; index < foodSources.length; index++) {
			nextLatitude  = foodSources[ index ].getAttribute('data-latitude');
			nextLongitude = foodSources[ index ].getAttribute('data-longitude');
			if (nextLatitude != null && nextLatitude != '') {
				dif = getDistanceInKilometers_Haversine(latitude, longitude, parseFloat(nextLatitude), parseFloat(nextLongitude));
			} else {
				dif = INFINITY; // infinity
			}
			list.push({
				element: foodSources[index],
				distance: dif
			});
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

		//list.splice(0, 25);

		var element, parent;
		for (index = 0; index < list.length; index++) {
			element = list[index].element;
			parent = element.parentNode;
			parent.removeChild(element);
			addDistance(element, list[index].distance);
			parent.appendChild(element);
		}

		foodSourcesList.classList.remove('sorting');
		
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
