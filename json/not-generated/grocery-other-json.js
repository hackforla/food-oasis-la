var locations = [

    {% for food_source in site.data['grocery-other'] %}

        {
            name: "{{ food_source['Name'] }}",
            type: "Store",
            address: "{{ food_source['StreetAddress'] }}, {{ food_source['City'] }}, {{ food_source['State'] }} {{ food_source['Zipcode'] }}",
            phone: "{{ food_source['Phone'] }}",
            website: "{{ food_source['Website'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['latitude'] }},
            longitude: {{ food_source['longitude'] }},
            distance: null

        },

    {% endfor %}
];
