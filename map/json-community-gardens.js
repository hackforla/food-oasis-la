---
layout: null
---

var locations = [

    {% for food_source in site.data['community-gardens'] %}

        {
            name: "{{ food_source['name'] }}",
            type: "Community Garden",
            address: "{{ food_source['streetaddress'] }}, {{ food_source['city'] }}, {{ food_source['state'] }} {{ food_source['zip'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['latitude'] }},
            longitude: {{ food_source['longitude'] }},
            distance: null

        },

    {% endfor %}
];