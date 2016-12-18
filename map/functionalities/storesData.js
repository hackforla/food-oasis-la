---
layout: null
---

var stores =

		{
			"type": "FeatureCollection",
			"features": [

			{% for food_source in site.data['food-banks'] %}
			  {
				"type": "Feature",
				"geometry": {
				  "type": "Point",
				  "coordinates": [
					{{ food_source['longitude'] }},
							 {{ food_source['latitude'] }}
				  ]
				},
				"properties": {
						"name": "{{ food_source['name'] }}",
				  //"phone": "{{ food_source['phone'] }}",
				  "address": "{{ food_source['address'] }}",
						//"hours": "{{ food_source['hours'] }}",
						"type": "food-bank"
				}
			  },
				{% endfor %}

// TBD: These are throwing errors so disable for now
{% if false %}
			{% for food_source in site.data['community-gardens'] %}
			  {
				"type": "Feature",
				"geometry": {
				  "type": "Point",
				  "coordinates": [
					{{ food_source['longitude'] }},
							 {{ food_source['latitude'] }}
				  ]
				},

				"properties": {
						"name": "{{ food_source['name'] }}",
				 "address": "{{ food_source['address'] | line_returns_to_html }}",
						"type": "community-garden"
				}
			  },
				{% endfor %}
			
			{% for food_source in site.data['farmers-markets'] %}
			  {
				"type": "Feature",
				"geometry": {
				  "type": "Point",
				  "coordinates": [
					{{ food_source['longitude'] }},
							 {{ food_source['latitude'] }}
				  ]
				},

				"properties": {
						"name": "{{ food_source['name'] }}",
				 "address": "{{ food_source['address'] }}",
						"type": "farmers-market"
				}
			  },
				{% endfor %}
			
			{% for food_source in site.data['supermarkets'] %}
			  {
				"type": "Feature",
				"geometry": {
				  "type": "Point",
				  "coordinates": [
					{{ food_source['longitude'] }},
							 {{ food_source['latitude'] }}
				  ]
				},

				"properties": {
						"name": "{{ food_source['name'] }}",
				 "address": "{{ food_source['StreetAddress'] }}",
						"type": "supermarket"
				}
			  },
				{% endfor %}
	{% endif %}

			],

		}
