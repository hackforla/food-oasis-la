window.oasis = window.oasis || {};

(function() {

	function sortByClosest(latitude, longitude) {
		var list = [];
		var nextLatitude, nextLongitude, dif;
		for (index = 0; index < locations.length; index++) {
			nextLatitude  = locations[ index ].latitude;
			nextLongitude = locations[ index ].longitude;
			if (nextLatitude != null && nextLatitude != '') {
				dif = window.oasis.getDistanceInKilometers(latitude, longitude, parseFloat(nextLatitude), parseFloat(nextLongitude));
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
