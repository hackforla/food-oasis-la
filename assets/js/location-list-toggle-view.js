
// Toggle between the map and list views
(function() {
	if (mapboxgl.supported()) {

		var views = document.getElementById('search-views');
		var template = document.getElementById('search-views-template');
		views.insertAdjacentHTML('beforeend', template.innerHTML);

		var mapButton = document.getElementById('map-button');
		var listButton = document.getElementById('list-button');

		listButton.style.display = "block";

		document.body.classList.add('only-map');
		document.body.classList.remove('only-list');

		mapButton.addEventListener('click', function(e) {
			mapButton.style.display = "none";
			listButton.style.display = "block";

			document.body.classList.add('only-map');
			document.body.classList.remove('only-list');

			e.preventDefault();
		}, false);

		listButton.addEventListener('click', function(e) {
			mapButton.style.display = "block";
			listButton.style.display = "none";

			document.body.classList.remove('only-map');
			document.body.classList.add('only-list');

			e.preventDefault();
		}, false);
	} else {
		if (console && console.log) console.log('MapboxGL doesn’t appear to be supported in this web browser. Showing the list instead…');
		document.body.classList.add('only-list');
	}
})();
