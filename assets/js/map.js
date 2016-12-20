(function() {

	var map;
	function createMap() {
		persistTypeParameter();

		mapboxgl.accessToken = MAP_ACCESS_TOKEN;
		map = new mapboxgl.Map({
			container: 'map',
			//style: 'mapbox://styles/mapbox/streets-v9',
			//style: 'mapbox://styles/mapbox/light-v9',
			style: 'mapbox://styles/mapbox/basic-v9',
			zoom: 13, // starting zoom
			center: MAP_START_POSITION, // starting position
			maxBounds: MAP_BOUNDS
		});

		var nav = new mapboxgl.Navigation({position: 'bottom-left'}); // position is optional
		map.addControl(nav);

		// Add 'Current Location' Functionality
		map.addControl(new mapboxgl.Geolocate());

		map.on('click', showPopup); 

		map.on('load', function() {
			addLayers();
			addFilterButtons();
			findUserLocation();
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

	function persistTypeParameter(type) {
		if (!type) type = getParameterByName('type');

		var address = getParameterByName('address');
		var searchLink = document.querySelector('.search a[href]');
		var href = '/list';

		if (type) {
			var form = document.querySelector('form.find');
			var typeField = form.querySelector('input[name="type"]');
			if (!typeField) {
				typeField = document.createElement('input');
				typeField.type = 'hidden';
				typeField.name = 'type';
				form.appendChild(typeField);
			}
			typeField.value = type;

			var typeArray = type.split('|');

			// SHIM: Only persist the type if there’s only one, since the list page only supports one type at a time (or all types at once).
			if (typeArray.length === 1) {
				href = '/' + typeArray[0];
			}
		}
		if (address) {
			href += '?address=' + address;

			var addressField = document.querySelector('input[name="address"]');
			addressField.value = address;
		}
		searchLink.setAttribute('href', href);
	}

	function addLayers() {
		for (var index = 0; index < MAP_LAYERS.length; index++) {
			addLayer(MAP_LAYERS[index], 9, 14, null); // Zoomed in
			addLayer(MAP_LAYERS[index], 6, 12, 14);
			addLayer(MAP_LAYERS[index], 3, null, 12); // Zoomed out
		}

		// Draw food desert census tracts
		map.addSource('Food Deserts', {
			type: 'vector',
			url: 'mapbox://foodoasisla.d040onrj'
		});
		map.addLayer({
			'id': 'Food Deserts',
			'type': 'fill',
			'source': 'Food Deserts',
			'layout': {
				'visibility': 'visible'
			},
			'paint': {
				'fill-color': '#FF0000',
				'fill-opacity': 0.1
			},
			'filter': ["==", "LI LA De_4", "1"],
			'source-layer': 'USDA_Food_Desert_Tracts_2010-65gavx'
		});
	}

	function addFilterButtons() {
		var layers = document.querySelector('.map-filters');

		for (var i = 0; i < MAP_LAYERS.length; i++) {
			layers.appendChild(createButton(MAP_LAYERS[i]));
		}
	}

	function addLayer(data, markerSize, minzoom, maxzoom) {
		var name = data.name + (!minzoom ? '-far' : (!maxzoom ? '-near' : ''));
		map.addSource(name, {
			type: 'vector',
			url: data.sourceURL
		});
		var layerData = {
			'id': name,
			'type': 'circle',
			'source': name,
			'layout': {
				'visibility': 'visible'
			},
			'paint': {
				'circle-radius': markerSize,
				'circle-color': data.color
			},
			'source-layer': data.sourceLayer
		};
		if (minzoom) layerData.minzoom = minzoom;
		if (maxzoom) layerData.maxzoom = maxzoom;
		map.addLayer(layerData);
	}

	function createButton(data) {

		var button = document.createElement('button');
		button.type = "button";
		button.className = data.name;
		button.setAttribute('data-type', data.name);
		
		if (data.label.endsWith('y')) {
		 	button.textContent = data.label.replace('y','ies');
		}
		else {
			button.textContent = data.label === 'Store' ? 'More Stores' : data.label + 's'; // SHIM: Pluralize (and add 'More' before 'Stores')
		}

		button.addEventListener('click', function(e) {
			e.preventDefault();

			var visibility = map.getLayoutProperty(data.name, 'visibility');

			if (visibility === 'visible') {
				map.setLayoutProperty(data.name, 'visibility', 'none');
				map.setLayoutProperty(data.name + '-near', 'visibility', 'none');
				map.setLayoutProperty(data.name + '-far', 'visibility', 'none');
				this.className += ' inactive';
			} else {
				map.setLayoutProperty(data.name, 'visibility', 'visible');
				map.setLayoutProperty(data.name + '-near', 'visibility', 'visible');
				map.setLayoutProperty(data.name + '-far', 'visibility', 'visible');
				this.className = this.className.replace(/inactive/g, '');
			}

			// SHIM: Make the filter stick
			var type = [];
			var activeButtons = document.querySelectorAll('.map-filters button:not(.inactive)');
			for (var index = 0; index < activeButtons.length; index++) {
				type.push(activeButtons[index].getAttribute('data-type'));
			}
			persistTypeParameter(type.join('|'));
		}, false);

		// If a type was requested and this button doesn’t match, toggle it off
		var type = getParameterByName('type');
		if (type) {
			type = type.split('|');
			var found = false;
			for (var index = 0; index < type.length; index++) {
				if (type[index] === data.name) found = true;
			}
			if (!found) button.click();

		// If no type was requested, toggle the “More Stores” layer off
		} else if (data.name === 'store') {
			button.click();
		}

		return button;
	}

	function getLayerLabel(name) {
		for (var index = 0; index < MAP_LAYERS.length; index++) {
			if (MAP_LAYERS[index].name === name) {
				return MAP_LAYERS[index].label;
			}
		}
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
				moveMapToPosition(myCoords, true);

			}, function() {
				console.error("Unable to retrieve your location");
			});
		}
	}

	function moveMapToPosition(position, geolocated) {

		map.setZoom(14); // TBD: Should we adjust this based on screen size? (Can we zoom until at least one store is visible?)
		map.panTo(position);

		var userLocationMarker;
		if (geolocated) {
			userLocationMarker = addYouAreHere(position);
		} else {
			userLocationMarker = addMarker(position);
		}

		// Find the closest location
		var closestMarkers = findClosestMarkers();

		// KUDOS: http://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
		if (closestMarkers.length > 0) {
			var group = new L.featureGroup(closestMarkers.push(userLocationMarker));
			map.fitBounds(group.getBounds());
		}
	}

	function findClosestMarkers() {
		// For each location
			// Calculate the distance from the user
		// Return the marker with the shortest distance

		// Bonus points: return more than one closest marker
		// Example: findClosestMarker(5)  ==>  returns the five closest markers

		return [];
	}

	function addMarker(position) {
		var template = document.getElementById('marker-template');

		var marker = document.createElement('div');
		marker.innerHTML = template.innerHTML;

		var address = getParameterByName('address');

		return new mapboxgl.Marker(marker)
			.setLngLat(position)
			.addTo(map);
	}

	function addYouAreHere(position) {
		var template = document.getElementById('you-are-here-template');

		var marker = document.createElement('div');
		marker.innerHTML = template.innerHTML;

		return new mapboxgl.Marker(marker)
			.setLngLat(position)
			.addTo(map);
	}

	var popup;
	function showPopup(event) {
		var layerNames = [];
		for (var i = 0; i < MAP_LAYERS.length; i++) {
			layerNames.push(MAP_LAYERS[i].name);
			layerNames.push(MAP_LAYERS[i].name + '-near');
			layerNames.push(MAP_LAYERS[i].name + '-far');
		}
		var features = map.queryRenderedFeatures(event.point, { 
			layers: layerNames
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

		var element = createPopupElement(feature);

		popup.setLngLat(feature.geometry.coordinates).setDOMContent(element).addTo(map);
	}

	function createPopupElement(feature) {

		var template = document.getElementById('popup-template');
		if (template) {
			var element = document.createElement('div');
			element.innerHTML = template.innerHTML;

			var data = getFeatureData(feature);

			// TEMPORARY: Hide links to grocery stores (since we don’t have food source pages for those).
			var showLink = true; //data.type != 'Grocery Store';

			// Name
			var nameElement = element.querySelector('h3');
			if (showLink) {
				var link = nameElement.querySelector('a');
				link.setAttribute('href', data.uri);
				link.innerText = data.name;
			} else {
				nameElement.innerText = data.name;
			}

			// Type
			var typeElement = element.querySelector('.type');
			typeElement.innerText = data.type;

			// Address
			if (data.address) element.querySelector('.address').innerHTML = data.address;

			// Phone
			var phoneElement = element.querySelector('.phone');
			if (data.phone) phoneElement.innerText = data.phone;
			else {
				var phoneElement = element.querySelector('.phone');
				phoneElement.parentNode.removeChild(phoneElement)
			}

			// Hours
			var hoursElement = element.querySelector('.hours');
			if (data.hours) {
				hoursElement.innerHTML = data.hours;
			} else {
				var h4 = element.querySelector('h4');
				h4.parentNode.removeChild(h4);

				hoursElement.parentNode.removeChild(hoursElement);
			}

			// Flag
			// URL: https://form.jotform.com/62638504761156?businessName=[name]&address=[address]&category=[category]&longitude=[lon]&latitude=[lat]

			var flagElement = element.querySelector('.flag');
			flagElement.setAttribute("href","https://form.jotform.com/62638504761156?businessName="+data.name+"&address="+data.address+"&category="+data.type+"&longitude="+01+"&latitude="+02)

			return element;
		}
	}

	// This is duplicated in _plugins/food_source_generator.rb
	function stringToURI(str) {
		return String(str).toLowerCase()
			.replace(/\s/g, '-')
			.replace(/\//g, '-')
			.replace(/\&/g, '-')
			.replace(/\./g, '-')
			.replace(/\:/g, '-')
			.replace(/\,/g, "-")
			.replace(/\+/g, "-")
			.replace(/\r\n?/, '-')	
			.replace(/\'/g, '')
			.replace(/\(/g, '')
			.replace(/\)/g, '')
			.replace(/\-\-\-\-/g, '-')
			.replace(/\-\-\-/g, '-')
			.replace(/\-\-/g, '-')
	}

	function getFeatureData(feature) {

		var data = {
			name:   feature.properties["name"] || 
					feature.properties["Name"] ||
					feature.properties["NAME"] ||
					feature.properties["NAME:"] ||
					feature.properties["MarketName"] ||
					feature.properties["GardenName"],
			type:   getLayerLabel(feature.layer.id.replace('-near', '').replace('-far', '')),
			hours:  feature.properties["hours"] ||
					feature.properties["times"] ||
					feature.properties["Times"] ||
					feature.properties["TIMES"] ||
					feature.properties["TIMES:"],
			phone:  feature.properties["phone"] ||
					feature.properties["telephone"] ||
					feature.properties["Telephone"] ||
					feature.properties["CONTACT"] ||
					feature.properties["CONTACT:"],
			latitude: 
					feature.properties["latitude"] ||
					feature.properties["Latitude"],
			longitude:
					feature.properties["longitude"] ||
					feature.properties["Longitude"],
			address: getFeatureAddress(feature)
		};

		// This is duplicated in _plugins/food_source_generator.rb
		data.uri = '/' + 
					data.type.toLowerCase().replace(/\s/g, '-')
					+ '/' + 
					stringToURI(data.name)
					+ '/' + 
					data.latitude
					+ '/' + 
					data.longitude;

		return data;
	}

	function getFeatureAddress(feature) {
		var address = "";

		var street = 
					feature.properties["address"] ||
					feature.properties["Address"] ||
					feature.properties["ADDRESS"] ||
					feature.properties["ADDRESS:"] ||
					feature.properties["StreetAddress"];
		var city = 
					feature.properties["city"] ||
					feature.properties["City"];
		var state = 
					feature.properties["state"] ||
					feature.properties["State"];

		if (street) 
				address += street;
		if (city)
				address += (street ? ', ' : '') + city;
		if (city && state)
				address += (city ? ', ' : (street ? ', ' : '')) + state;

		return address;
	}

	createMap();

})();
