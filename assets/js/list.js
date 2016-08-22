(function() {

	var foodSourcesList = document.querySelector('.food-source-list');

	var foodSources = foodSourcesList.querySelectorAll('li');

	function findUserLocation() {
		var address = getParameterByName('address');

		// If the user passed in an address
		if (address) {

			// Add Los Angeles to the address
			if (address.indexOf('Los Angeles') < 0) {
				address += ' Los Angeles';
			}

			foodSourcesList.classList.add('sorting');

			// KUDOS: http://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position#answer-21297385
			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'address': address}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {

					var latitude  = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

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

			}, function() {
				foodSourcesList.classList.remove('sorting');
				console.error("Unable to retrieve your location");
			});
		}
	}

	function sortByClosest(latitude, longitude) {
		var list = [];
		for (index = 0; index < foodSources.length; ++index) {
			var dif = PythagorasEquirectangular(latitude, longitude,
				parseFloat(foodSources[ index ].getAttribute('data-latitude')),
				parseFloat(foodSources[ index ].getAttribute('data-longitude'))
				);
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
		for (index = 0; index < list.length; ++index) {
			var element = list[index].element;
			var parent = element.parentNode;
			parent.removeChild(element);
			parent.appendChild(element);
		}

		foodSourcesList.classList.remove('sorting');
	}

	function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
		lat1 = Deg2Rad(lat1);
		lat2 = Deg2Rad(lat2);
		lon1 = Deg2Rad(lon1);
		lon2 = Deg2Rad(lon2);
		var R = 6371; // km
		var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
		var y = (lat2-lat1);
		var d = Math.sqrt(x*x + y*y) * R;
		return d;
	}

	// Convert Degress to Radians
	function Deg2Rad(deg) {
		return deg * Math.PI / 180;
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
