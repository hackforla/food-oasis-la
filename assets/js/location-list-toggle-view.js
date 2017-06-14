window.oasis = window.oasis || {};

// Toggle between the map and list views
(function() {

	var views = document.getElementById('search-views');
	var template = document.getElementById('search-views-template');
	views.insertAdjacentHTML('beforeend', template.innerHTML);

	var mapButton = document.getElementById('map-button');
	var listButton = document.getElementById('list-button');
	var title = document.getElementById('list-results-title');

	function showMap() {
		mapButton.style.display = "none";
		listButton.style.display = "block";

		document.body.classList.add('only-map');
		document.body.classList.remove('only-list');

		if (window.oasis.hideLocationSummary) window.oasis.hideLocationSummary();

		window.scrollTo(0, 0);
	}

	function showList() {
		mapButton.style.display = "block";
		listButton.style.display = "none";

		document.body.classList.remove('only-map');
		document.body.classList.add('only-list');

		if (window.oasis.hideLocationSummary) window.oasis.hideLocationSummary();

		window.scrollTo(0, 0);
	}

	function onMapClick(e) {
		showMap();
		e.preventDefault();
	}

	function onListClick(e) {
		showList();
		e.preventDefault();
	}

	function hideToggleButtons() {
		mapButton.removeEventListener('click', onMapClick, false);
		listButton.removeEventListener('click', onListClick, false);
		mapButton.style.opacity = '0';
		listButton.style.opacity = '0';
	}

	mapButton.addEventListener('click', onMapClick, false);
	listButton.addEventListener('click', onListClick, false);
	title.addEventListener('click', onListClick, false);

	showList();

	window.oasis.showMap  = showMap;
	window.oasis.showList = showList;
	window.oasis.hideToggleButtons = hideToggleButtons;
})();
