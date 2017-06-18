'use strict';

window.oasis = window.oasis || {};

(function() {

	// latitude is the position of the center of the map
	// userLatitude is the position the user searched for
	function sortByClosest(latitude, longitude, userLatitude, userLongitude) {
		if (!userLatitude || !userLongitude) {
			userLatitude  = latitude;
			userLongitude = longitude;
		}
		let list = [];
		let nextLatitude, nextLongitude, distance, travelDistance, distanceFromUser;
		for (let index = 0; index < locations.length; index++) {
			nextLatitude  = locations[ index ].latitude;
			nextLongitude = locations[ index ].longitude;
			if (nextLatitude != null && nextLatitude != '') {
				distance       = window.oasis.getDistanceInKilometers(latitude,     longitude,     parseFloat(nextLatitude), parseFloat(nextLongitude));
				travelDistance = window.oasis.getDistanceInKilometers(userLatitude, userLongitude, parseFloat(nextLatitude), parseFloat(nextLongitude));
			} else {
				distance       = window.oasis.INFINITY;
				travelDistance = window.oasis.INFINITY;
			}
			locations[index].distance       = distance;
			locations[index].travelDistance = travelDistance;
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

		let type = window.oasis.getParameterByName('type');
		if (type) {
			let types = type.split('|');
			list = list.filter(function(item) {
				for (let index = 0; index < types.length; index++) {
					if (item.category.toLowerCase().replace(/\s/g, '-') === types[index]) {
						return true;
					}
				}

				// SHIM: Always show misc locations, if we’re showing all types
				if (item.uri.indexOf('locations/') >= 0 && (types.length === 8 || types.length === 0)) {
					return true;
				}

				return false;
			});
		}

		let open = window.oasis.getParameterByName('open');
		if (open) {
			list = list.filter(function(item) {
				let open = false;
				for (let index = 0; index < item.hours.length; index++) {
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
