---
layout: null
---

var communityGardensLocations = [

    {% for food_source in site.data['community-gardens'] %}

        {
            name: "{{ food_source['GardenName'] }}",
            type: "Community Garden",
            address: "{{ food_source['StreetAddress'] }}, {{ food_source['City'] }}, {{ food_source['State'] }} {{ food_source['Zipcode'] }}",
            phone: "{{ food_source['phone'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['latitude'] }},
            longitude: {{ food_source['longitude'] }},
            distance: null

        },

    {% endfor %}
];