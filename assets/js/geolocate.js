window.oasis = window.oasis || {};

(function() {

	var LOS_ANGELES = {
		latitude: 34.052234,
		longitude: -118.243685
	};

	var lastUserLocation;

	function findUserLocation(callback) {
		var address = window.oasis.getParameterByName('address');

		// If the user passed in an address, and if the Google Maps geocoder is available
		if (address && "google" in window) {

			getCoordinatesFromAddress(address, callback);

		// Else if automatic geolocation is available
		} else if ("geolocation" in navigator) {

			getCoordinatesFromDevice(callback);
			
		} else {
			setLastUserLocation({
				latitude: LOS_ANGELES.latitude,
				longitude: LOS_ANGELES.longitude,
				label: 'Downtown Los Angeles'
			});
			if (callback) callback(getLastUserLocation());
		}
	}

	function getCoordinatesFromAddress(address, callback) {

		// Add Los Angeles to the address
		if (address.indexOf('Los Angeles') < 0) {
			address += ' Los Angeles';
		}

		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {

				var latitude  = results[0].geometry.location.lat();
				var longitude = results[0].geometry.location.lng();

				setLastUserLocation({
					latitude: latitude,
					longitude: longitude,
					label: window.oasis.getParameterByName('address'),
					wasFound: true
				});
				if (callback) callback(getLastUserLocation());

			} else {
				console.error('Geocode was not successful for the following reason: ' + status);
				setLastUserLocation({
					latitude: LOS_ANGELES.latitude,
					longitude: LOS_ANGELES.longitude,
					label: 'Downtown Los Angeles'
				});
				if (callback) callback(getLastUserLocation());
			}
		});
	}

	function getCoordinatesFromDevice(callback) {
		navigator.geolocation.getCurrentPosition(function(position) {

			setLastUserLocation({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				label: 'you',
				wasFound: true
			});
			if (callback) callback(getLastUserLocation());

		}, function() {
			console.error("Unable to retrieve your location");

			setLastUserLocation({
				latitude: LOS_ANGELES.latitude,
				longitude: LOS_ANGELES.longitude,
				label: 'Downtown Los Angeles'
			});
			if (callback) callback(getLastUserLocation());
		});
	}

	function setLastUserLocation(location) {
		lastUserLocation = location;
	}

	function getLastUserLocation() {
		return lastUserLocation;
	}

	window.oasis.findUserLocation = findUserLocation;
	window.oasis.getCoordinatesFromAddress = getCoordinatesFromAddress;
	window.oasis.getLastUserLocation = getLastUserLocation;
})();
