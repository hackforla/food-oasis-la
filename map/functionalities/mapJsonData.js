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
