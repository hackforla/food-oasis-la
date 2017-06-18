'use strict';

(function() {

	/*
	Loop through the list of hours
	For each day, check to see if it matches the current date
	If there’s a match
		If the store is open
			Show an open indicator inline and at the top of the page
		Else
			Show a closed indicator inline and at the top of the page
	*/

	let headerOpenNowShowing = false;
	function showOpenNowInHeader() {
		if (headerOpenNowShowing) return;
		let openTemplate = document.querySelector('.open-template');
		openTemplate.parentNode.insertAdjacentHTML('beforeend', openTemplate.innerHTML);
		headerOpenNowShowing = true;
	}

	(function() {
		let dtElements = document.querySelectorAll('dt[data-day]');
		let ddElements = document.querySelectorAll('dd[data-day]');

		for (let index = 0; index < dtElements.length; index++) {
			(function() {
				let dt = dtElements[index];
				let dd = ddElements[index];
				let data = {
					day: dd.getAttribute('data-day'),
					open: dd.getAttribute('data-open'),
					close: dd.getAttribute('data-close')
				};
				if (window.oasis.isOpenNow(data)) {
					dt.classList.add('open');
					dd.classList.add('open');
					let notice = document.createElement('i');
					notice.textContent = 'Open Now';
					dd.appendChild(document.createTextNode(' '));
					dd.appendChild(notice);
					showOpenNowInHeader();
				}
			})();
		}
	})();

})();


(function() {
	if (document.getElementById('map') && 'mapboxgl' in window && mapboxgl.supported()) {

		// Create the map
		mapboxgl.accessToken = MAP_ACCESS_TOKEN;

		let map = new mapboxgl.Map({
			container: 'map', // container id
			style: MAP_STYLE,
			center: [LOCATION_DETAILS.longitude, LOCATION_DETAILS.latitude], // starting position
			scrollZoom: false,
			zoom: 14 // starting zoom
		});

		// Add a zoom control
		map.addControl(new mapboxgl.NavigationControl( { position: 'top-right' } )); // position is optional

		// Add a marker at the location of the food source
		let template = document.getElementById('marker-template');
		if (template) {
			let marker = document.createElement('div');
			marker.innerHTML = template.innerHTML;

			new mapboxgl.Marker(marker)
				.setLngLat([LOCATION_DETAILS.longitude, LOCATION_DETAILS.latitude])
				.addTo(map);
		}
		(function() {
			function expandMap() {
				document.getElementById('map').className += ' expanded';
				map.resize();
				map.scrollZoom.enable();
			}
			document.getElementById('map').addEventListener('click', expandMap, false);
		})();

	} else {
		if (console && console.log) console.log('MapboxGL doesn’t appear to be supported in this web browser. Hiding the map…');
		document.getElementById('map').style.display = 'none';
	}
})();

(function() {

	let PAGE_PARAMETERS = {
		type    : window.oasis.getParameterByName('type'),
		address : window.oasis.getParameterByName('address'),
		deserts : window.oasis.getParameterByName('deserts'),
		open    : window.oasis.getParameterByName('open')
	};

	// Distance
	if (PAGE_PARAMETERS.type || PAGE_PARAMETERS.address || PAGE_PARAMETERS.deserts || PAGE_PARAMETERS.open) { // If the user came from the search page
		let distance;
		window.oasis.findUserLocation(function(userLocation) {
			if (LOCATION_DETAILS.latitude != null && LOCATION_DETAILS.latitude != '' && userLocation && userLocation.latitude && userLocation.longitude) {
				distance = window.oasis.getDistanceInKilometers(userLocation.latitude, userLocation.longitude, parseFloat(LOCATION_DETAILS.latitude), parseFloat(LOCATION_DETAILS.longitude));
			} else {
				distance = window.oasis.INFINITY;
			}

			if (distance && distance != window.oasis.INFINITY) {
				let distanceTemplate = document.querySelector('.distance-template');
				distanceTemplate.parentNode.insertAdjacentHTML('beforeend', distanceTemplate.innerHTML);
				distanceTemplate.parentNode.querySelector('.distance span').innerHTML = window.oasis.getDistanceForPresentation(distance);
			}
		});
	}

	function updateLink(link) {
		let params = [];
		if (PAGE_PARAMETERS.type)    params.push('type='    + PAGE_PARAMETERS.type);
		if (PAGE_PARAMETERS.address) params.push('address=' + PAGE_PARAMETERS.address);
		if (PAGE_PARAMETERS.deserts) params.push('deserts=' + PAGE_PARAMETERS.deserts);
		if (PAGE_PARAMETERS.open)    params.push('open='    + PAGE_PARAMETERS.open);

		let queryString = params.join('&');
		link.setAttribute('href', link.getAttribute('href') + '?' + queryString);
	}

	if (PAGE_PARAMETERS.type || PAGE_PARAMETERS.address || PAGE_PARAMETERS.deserts || PAGE_PARAMETERS.open) {
		let link = document.getElementById('back-link');
		if (link) {
			updateLink(link);
			link.querySelector('span').textContent = 'Back to All Results';
		}
	}

})();
