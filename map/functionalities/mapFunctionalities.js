
// <script src="mapJsonData.js"></script>
---
layout: null
---

var locations = [

    {% for food_source in site.data['food_banks_andrew'] %}

        {
            name: "{{ food_source["name""] }}",
            type: "Food Bank",
            address: "{{ food_source["address""] }}",
            hours: "{{ food_source["hours""] }}",
            latitude: {{ food_source["latitude""] }},
            longitude: {{ food_source["longitude""] }},
            distance: null

        },

    {% endfor %}
];

var latitude = 34.0394605;
var longitude = -118.4428459;

	function sortByClosest(latitude, longitude) {
		var list = [];
		for (index = 0; index < locations.length; ++index) {
			var dif = PythagorasEquirectangular(latitude, longitude, locations[index].latitude, locations[index].longitude);
			locations[index].distance = dif;
		}
		locations.sort(function(a, b) {
			if (a.distance > b.distance) {
				return 1;
			}
			if (a.distance < b.distance) {
				return -1;
			}
			// a must be equal to b
			return 0;
		});
	}

	function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
		lat1 = Deg2Rad(lat1);
		lat2 = Deg2Rad(lat2);
		lon1 = Deg2Rad(lon1);
		lon2 = Deg2Rad(lon2);
		var R = 6371; // km
		var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
		var y = (lat2-lat1);
		var d = Math.sqrt(x*x + y*y) * R;
		return d;
	}

	// Convert Degress to Radians
	function Deg2Rad(deg) {
		return deg * Math.PI / 180;
	}

sortByClosest(latitude, longitude);
