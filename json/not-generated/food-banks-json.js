var locations = [

    {% for food_source in site.data['food-banks'] %}

        {
            name: "{{ food_source['Name'] }}",
            type: "Food Bank",
            address: "{{ food_source['Street Address'] }}, {{ food_source['City'] }}, CA {{ food_source['Zip Code'] }}",
            phone: "{{ food_source['Phone'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['Latitude'] }},
            longitude: {{ food_source['Longitude'] }},
            distance: null

        },

    {% endfor %}
];
