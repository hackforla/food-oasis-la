window.oasis = window.oasis || {};

(function() {
	var INFINITY = 9999999;

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

	// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula/27943#answer-27943
	function getDistanceInKilometers_Haversine(lat1, lon1, lat2, lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1);
		var a =
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon/2) * Math.sin(dLon/2)
		;
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c; // Distance in km
		return d;
	}

	// Convert Degress to Radians
	function deg2rad(deg) {
		return deg * (Math.PI/180)
	}


	function getDistanceForPresentation(kilometers) {
		if (kilometers === window.oasis.INFINITY) return 'unknown';

		var miles = kilometers / 1.609; // kilometers per mile
		miles = Math.round10(miles, -1); // Round to one decimal place
		return parseFloat(miles.toFixed(1));
	}

	// http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript#12830454#answer-25075575
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding
	(function() {
		/**
		 * Decimal adjustment of a number.
		 *
		 * @param {String}  type  The type of adjustment.
		 * @param {Number}  value The number.
		 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
		 * @returns {Number} The adjusted value.
		 */
		 function decimalAdjust(type, value, exp) {
			// If the exp is undefined or zero...
			if (typeof exp === 'undefined' || +exp === 0) {
				return Math[type](value);
			}
			value = +value;
			exp = +exp;
			// If the value is not a number or the exp is not an integer...
			if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
				return NaN;
			}
			// Shift
			value = value.toString().split('e');
			value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
			// Shift back
			value = value.toString().split('e');
			return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
		}

		// Decimal round
		if (!Math.round10) {
			Math.round10 = function(value, exp) {
				return decimalAdjust('round', value, exp);
			};
		}
		// Decimal floor
		if (!Math.floor10) {
			Math.floor10 = function(value, exp) {
				return decimalAdjust('floor', value, exp);
			};
		}
		// Decimal ceil
		if (!Math.ceil10) {
			Math.ceil10 = function(value, exp) {
				return decimalAdjust('ceil', value, exp);
			};
		}
	})();


	var isOpenNow;
	(function() {
		var DAYS_OF_WEEK = [
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
			'Sat'
		];
		function getSeconds(timeString) { // Example: 1430 ==> 14.5 hours ==> 52,200 seconds
			var hours   = Number(timeString.substring(0, timeString.length - 2));
			var minutes = Number(timeString.substring(timeString.length - 2));
			return (hours * 60 * 60) + (minutes * 60);
		}
		isOpenNow = function(data) {
			if (data.day && data.open && data.close) {

				var now = new Date();
				var pacificTime = (now.toString().indexOf('(PDT)') >= 0) || (now.toString().indexOf('(PST)') >= 0);

				var time = now.toTimeString();
				var nowSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();

				if (pacificTime &&
					DAYS_OF_WEEK[now.getDay()] === data.day &&
					nowSeconds > getSeconds(data.open) &&
					nowSeconds < getSeconds(data.close) ) {
					return true;
				}

				// TBD: Should we show a special notice if it’s opening soon or closing soon?
			}
			return false;
		}
	})();

	window.oasis.INFINITY = INFINITY;
	window.oasis.getParameterByName = getParameterByName;
	window.oasis.getDistanceInKilometers = getDistanceInKilometers_Haversine;
	window.oasis.getDistanceForPresentation = getDistanceForPresentation;
	window.oasis.isOpenNow = isOpenNow;
})();
