window.oasis = window.oasis || {};

(function() {

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

	function sortByClosest(latitude, longitude) {
		var list = [];
		var nextLatitude, nextLongitude, dif;
		for (index = 0; index < locations.length; index++) {
			nextLatitude  = locations[ index ].latitude;
			nextLongitude = locations[ index ].longitude;
			if (nextLatitude != null && nextLatitude != '') {
				dif = getDistanceInKilometers_Haversine(latitude, longitude, parseFloat(nextLatitude), parseFloat(nextLongitude));
			} else {
				dif = window.oasis.INFINITY;
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

		var type = window.oasis.getParameterByName('type');
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

		var open = window.oasis.getParameterByName('open');
		if (open) {
			list = list.filter(function(item) {
				var open = false;
				for (var index = 0; index < item.hours.length; index++) {
					if (window.oasis.isOpenNow(item.hours[index])) {
						open = true;
					}
				}

				return open;
			});
		}
		return list;
	}

	window.oasis.sortByClosest = sortByClosest;
})();
