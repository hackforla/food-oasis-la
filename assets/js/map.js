(function() {

	var map;
	function createMap() {

		map = new mapboxgl.Map({
			container: 'map', // container id
			style: MAP_STYLESHEET,
			center: MAP_START_POSITION, // starting position
			zoom: 13, // starting zoom
			maxBounds: MAP_BOUNDS
		});

		var nav = new mapboxgl.Navigation({position: 'bottom-left'}); // position is optional
		map.addControl(nav);

		// Add 'Current Location' Functionality
		map.addControl(new mapboxgl.Geolocate());

		map.on('click', showPopup); 

		findUserLocation();
	}

	function findUserLocation() {
		var address = getParameterByName('address');

		if (address) {

			// Add Los Angeles to the address
			if (address.indexOf('Los Angeles') < 0) {
				address += ' Los Angeles';
			}

			geocodeAddress(address, moveMapToPosition);

		// Grab user's location on page-load
		} else if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(function(position) {

				// Set new starting location
				var myCoords = [position.coords.longitude, position.coords.latitude];
				moveMapToPosition(myCoords)

			}, function() {
				console.error("Unable to retrieve your location");
			});
		}
	}

	function moveMapToPosition(position) {
		 map.setZoom(14);
		 map.panTo(position);

		// Add a marker at the user’s location
		var template = document.getElementById('marker-template');
		if (template) {
			var marker = document.createElement('div');
			marker.innerHTML = template.innerHTML;

			new mapboxgl.Marker(marker)
				.setLngLat(position)
				.addTo(map);
		}
	}

	var urlTag = getParameterByName('type');

	console.log(urlTag);

	var layersArray = ['Food Banks (Solution)',
	'CG-UF-N (Solution)',
	'Farmers Markets (Solution)',
	'Groceries (Problem)'];


	var popup;
	
	function showPopup(event) {
		var features = map.queryRenderedFeatures(event.point, { 
			layers: layersArray
		});

		if (!popup) {
			popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false
			});
		}

		// Change the cursor style as a UI indicator.
		map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
		if (!features.length) {
			popup.remove();
			return;
		}

		var feature = features[0];

		// TEMPORARY: Only show links to food banks (since the /source/ pages are only generated for food banks presently).
		var showLink = (feature.layer.id === 'Food Banks (Solution)') ? true : false;

		var element = createPopupElement(feature, showLink);

		popup.setLngLat(feature.geometry.coordinates).setDOMContent(element).addTo(map);
	}

	function createPopupElement(feature, showLink) {

		var template = document.getElementById('popup-template');
		if (template) {
			var element = document.createElement('div');
			element.innerHTML = template.innerHTML;

			var data = getFeatureData(feature);

			// Name
			var nameElement = element.querySelector('h3');
			if (showLink) {
				var link = nameElement.querySelector('a');
				link.setAttribute('href', link.getAttribute('href') + '/' + data.uri);
				link.innerHTML = data.name;
			} else {
				nameElement.innerHTML = data.name;
			}

			// Type
			var typeElement = element.querySelector('.type');
			typeElement.innerHTML = data.type;
			// typeElement.className += ' ' + type;

			// Address
			if (data.address) element.querySelector('.address').innerHTML = data.address;

			// Phone
			if (data.phone) element.querySelector('.phone').innerHTML = data.phone;

			// Hours
			var hoursElement = element.querySelector('.hours');
			if (data.hours) {
				hoursElement.innerHTML = data.hours;
			} else {
				var h4 = element.querySelector('h4');
				h4.parentNode.removeChild(h4);

				hoursElement.parentNode.removeChild(hoursElement);
			}

			return element;
		}
	}

	function getFeatureData(feature) {

		var data = {
			name: 	feature.properties["name"] || 
					feature.properties["Name"] ||
					feature.properties["NAME"] ||
					feature.properties["NAME:"] ||
					feature.properties["MarketName"],
			type:   getFeatureType(feature),
			hours: 	feature.properties["times"] ||
					feature.properties["Times"] ||
					feature.properties["TIMES"] ||
					feature.properties["TIMES:"],
			phone: 	feature.properties["telephone"] ||
					feature.properties["Telephone"] ||
					feature.properties["CONTACT"] ||
					feature.properties["CONTACT:"],
			address: getFeatureAddress(feature)
		};

		data.uri = data.name.toLowerCase()
					.replace(/\s/g, '-')
					.replace(/\//g, '-')
					.replace(/\&/g, '-')
					.replace(/\./g, '-')
					.replace(/\'/g, '')
					.replace(/\-\-/g, '-');

		return data;
	}

	function getFeatureType(feature) {
		if (feature.layer.id.indexOf('Food Bank') >= 0) return 'Food Bank';
		if (feature.layer.id.indexOf('Farmers Market') >= 0) return 'Farmers Market';
		if (feature.layer.id.indexOf('Groceries') >= 0) return 'Grocery Store';
		if (feature.layer.id.indexOf('CG-UF-N') >= 0) return 'Garden';
	}

	function getFeatureAddress(feature) {
		var address = "";

		var street = 
					feature.properties["address"] ||
					feature.properties["Address"] ||
					feature.properties["ADDRESS"] ||
					feature.properties["ADDRESS:"];
		var city = 
					feature.properties["city"] ||
					feature.properties["City"];
		var state = 
					feature.properties["state"] ||
					feature.properties["State"];

		if (street) 
				address += street;
		if (city)
				address += (street ? '<br />' : '') + city;
		if (state)
				address += (city ? ', ' : (street ? '<br />' : '')) + state;

		return address;
	}

	function geocodeAddress(address, callback) {
		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {

				var longitude = results[0].geometry.location.lng();
				var latitude  = results[0].geometry.location.lat();

				callback([longitude, latitude]);

			} else {
				console.error('Geocode was not successful for the following reason: ' + status);
			}
		});
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

	createMap();

})();
