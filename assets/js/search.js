'use strict';

(function() {
	// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#answer-901144
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	// SHIM: Make the type persistent
	let type = getParameterByName('type');
	if (type) {
		let types = type.split('|');
		let typeFields = document.querySelectorAll('input[data-name="type_option"]:checked');
		for (let index = 0; index < typeFields.length; index++) {
			(function() {
				let field = typeFields[index];
				for (let j = 0; j < types.length; j++) {
					if (types[j] === field.value) {
						field.checked = true;
						return;
					}
				}
				field.checked = false;
			})();
		}
	}

	// SHIM: Pass the type onto the next page as one pipe-delimited query string value
	let form = document.querySelector('form');
	form.addEventListener('submit', function(e) {
		let typeFields = document.querySelectorAll('input[data-name="type_option"]:checked');
		let types = [];
		for (let index = 0; index < typeFields.length; index++) {
			types.push(typeFields[index].value);
			//typeFields[index].checked = false;
		}
		let hiddenType = document.querySelector('input[type="hidden"][name="type"]');
		hiddenType.value = types.join('|');
		form.submit();
		e.preventDefault();
	}, false);

	// SHIM: Make the address persistent
	let address = getParameterByName('address');
	if (address) {
		let addressField = document.querySelector('input[name="address"]');
		addressField.value = address;
	}

	// SHIM: Make the food deserts option persistent
	let deserts = getParameterByName('deserts');
	if (deserts) {
		let desertsField = document.querySelector('input[name="deserts"]');
		if (desertsField.type === 'checkbox') {
			desertsField.checked = (deserts && deserts != '') ? true : false;
		} else {
			desertsField.value = deserts;
		}
	}

	// SHIM: Make the “open now” option persistent
	let open = getParameterByName('open');
	if (open) {
		let openField = document.querySelector('input[name="open"]');
		if (openField.type === 'checkbox') {
			openField.checked = (open && open != '') ? true : false;
		} else {
			openField.value = open;
		}
	}

	/**
	 * Uses the browser geolocation method to reverse geocode the user's
	 * address based on the provided lat/lng.
	 * @return {Promise) successful promise returns an array of result obejcts
	 * TODO: Reverse geolocation is a little awkward here. This is because the
	 * map view is looking for an address parameter. Ideally, we can skip
	 * reverse geo completely and jsut pass some lat/lng url parameters to the
	 * map view.
	 * view should be able to
	 */
	function getCurrentLocation() {
		return new Promise(function(resolve, reject) {
			navigator.geolocation.getCurrentPosition(function(position) {
			let geocoder = new google.maps.Geocoder;
			geocoder.geocode({
					location: {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					}
				}, function(results, status) {
				 	if (status === 'OK') {
						resolve(results);
					} else {
						reject();
					}
				}, function() {
					reject();
				});
			});
		});
	}

	// If the user's browser allows geolocation, reveal any "Use Current
	// Location" buttons and attach handlers. These buttons use Google's
	// geocoder to reverse geolocate based on the user's address.
	if ('geolocation' in navigator) {
		let form = document.getElementById('search-form');
		let currentLocationButtons =
				document.getElementsByClassName('js-current-location');
		let addressField =
				form.querySelectorAll('input[name="address"]')[0];
		for (let i = 0; i < currentLocationButtons.length; i++) {
			let button = currentLocationButtons[i];
			button.addEventListener('click', function(e) {
				// TODO: Some kind of "loading" spinner would be good here because
				// the navigator.geolocation method tends to take a while.
				if (button.disabled) {
					return false;
				}
				e.preventDefault();
				button.disabled = true;
				getCurrentLocation().then(function(results) {
					if (results.length) {
						// If geolocation results are returned, prefer to use the second
						// result. The first one is a little too specific and may not
						// be accurate to the user.
						addressField.value = results[1] ? results[1].formatted_address :
								results[0].formatted_address;
						//form.submit();
					}
					button.disabled = false;
				}).catch(function() {
					// TODO: some kind of error handler here would be good. Maybe
					// a message saying that you need to allow the browser to use
					// your current location.
					button.disabled = false;
				});
			});
			currentLocationButtons[i].classList.remove('hidden');
		}
	}
})();
