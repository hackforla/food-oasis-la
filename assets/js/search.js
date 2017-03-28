(function() {
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

	// SHIM: Make the type persistent
	var type = getParameterByName('type');
	if (type) {
		var types = type.split('|');
		var typeFields = document.querySelectorAll('input[data-name="type_option"]:checked');
		for (var index = 0; index < typeFields.length; index++) {
			(function() {
				var field = typeFields[index];
				for (var j = 0; j < types.length; j++) {
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
	var form = document.querySelector('form');
	form.addEventListener('submit', function(e) {
		var typeFields = document.querySelectorAll('input[data-name="type_option"]:checked');
		var types = [];
		for (var index = 0; index < typeFields.length; index++) {
			types.push(typeFields[index].value);
			//typeFields[index].checked = false;
		}
		var hiddenType = document.querySelector('input[type="hidden"][name="type"]');
		hiddenType.value = types.join('|');
		form.submit();
		e.preventDefault();
	}, false);

	// SHIM: Make the address persistent
	var address = getParameterByName('address');
	if (address) {
		var addressField = document.querySelector('input[name="address"]');
		addressField.value = address;
	}

	// SHIM: Make the food deserts option persistent
	var deserts = getParameterByName('deserts');
	if (deserts) {
		var desertsField = document.querySelector('input[name="deserts"]');
		if (desertsField.type === 'checkbox') {
			desertsField.checked = (deserts && deserts != '') ? true : false;
		} else {
			desertsField.value = deserts;
		}
	}

	// SHIM: Make the “open now” option persistent
	var open = getParameterByName('open');
	if (open) {
		var openField = document.querySelector('input[name="open"]');
		if (openField.type === 'checkbox') {
			openField.checked = (open && open != '') ? true : false;
		} else {
			openField.value = open;
		}
	}

})();
