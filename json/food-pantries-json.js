---
layout: null
---

var locations = [

    {% for food_source in site.data['food-pantries'] %}

        {
            name: "{{ food_source['Name'] }}",
            type: "{{ food_source['Category'] }}",
            address: "{{ food_source['StreetAddress'] }}, {{ food_source['City'] }}, {{ food_source['State'] }} {{ food_source['Zipcode'] }}",
            phone: "{{ food_source['Telephone'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['latitude'] }},
            longitude: {{ food_source['longitude'] }},
            distance: null

        },

    {% endfor %}
];