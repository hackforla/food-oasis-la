window.oasis = window.oasis || {};

(function() {

	function createListItem(data, containerTagName) {

		var template = document.getElementById('list-item-template');
		if (template) {
			var element = document.createElement(containerTagName);
			var category = data.category.toLowerCase().replace(' ', '-'); // Example: farmers-market
			element.innerHTML = template.innerHTML;
			element.className = category;

			// Name
			var nameElement = element.querySelector('h2');
			nameElement.textContent = data.name;

			var params = [];
			if (PAGE_PARAMETERS.type) params.push('type=' + PAGE_PARAMETERS.type);
			if (PAGE_PARAMETERS.address) params.push('address=' + PAGE_PARAMETERS.address);
			if (PAGE_PARAMETERS.deserts) params.push('deserts=' + PAGE_PARAMETERS.deserts);
			if (PAGE_PARAMETERS.open) params.push('open=' + PAGE_PARAMETERS.open);

			var queryString = params.join('&');

			var link = element.querySelector('a');
			link.setAttribute('href', data.uri + '?' + queryString);

			// Category (Type)
			var typeElement = element.querySelector('.type');
			typeElement.textContent = data.category;
			var img = element.querySelector('img');
			img.src = "/assets/images/home/" + category + ".svg"; // SHIM: Should we handle this in the CSS instead?

			// Address
			if (data.address_1) element.querySelector('.address').innerHTML = data.address_1;

			// Open Now
			var open = false;
			for (var index = 0; index < data.hours.length; index++) {
				if (window.oasis.isOpenNow(data.hours[index])) {
					open = true;
				}
			}
			if (!open) {
				var openNowElement = element.querySelector('.open');
				openNowElement.parentNode.removeChild(openNowElement);
			}

			// Distance
			if (data.distance) element.querySelector('.distance span').innerHTML = window.oasis.getDistanceForPresentation(data.distance);

			return element;
		}
	}

	var sortedLocations;
	function addListItems(locations) {
		sortedLocations = locations;
		var limit = window.oasis.getParameterByName('limit') || itemsPerPage;
		if (!limit) {
			limit = 10;
		}
		limit = Number(limit);
		var start = window.listOffset || 0;
		limit += start;
		if (limit >= sortedLocations.length) limit = locations.length;
		var list = document.querySelector('ul.location-list');
		if (list) {
			list.innerHTML = '';
			for (var index = start; index < sortedLocations.length && index < limit; index++) {
				list.appendChild(createListItem(sortedLocations[index], 'li'));
			}
		}

		if (sortedLocations.length < 1) {
			var template = document.getElementById('no-results-template');
			var map = document.getElementById('map');
			if (template && map) {
				var div = document.createElement('div');
				div.innerHTML = template.innerHTML;
				map.parentNode.insertBefore(div, map);
			}
		}
	}

	window.oasis.createListItem = createListItem;
	window.oasis.addListItems = addListItems;
})();
