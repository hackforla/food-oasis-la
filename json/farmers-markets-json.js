---
layout: null
---

var locations = [

    {% for food_source in site.data['farmers-markets'] %}

        {
            name: "{{ food_source['MarketName'] }}",
            type: "{{ food_source['Category'] }}",
            address: "{{ food_source['Address'] }}, {{ food_source['City'] }}, {{ food_source['State'] }} {{ food_source['Zipcode'] }}",
            phone: "{{ food_source['Phone'] }}",
            website: "{{ food_source['Website'] }}",
            hours: "{{ food_source['hours'] }}",
            latitude: {{ food_source['latitude'] }},
            longitude: {{ food_source['longitude'] }},
            distance: null

        },

    {% endfor %}
];

//FM_ID,MarketName,Category,Address,City,State,Zip,Phone,Website,season_open,season_close,day_open,time_open,time_close,longitude,latitude,EBT,day1_open,day1_close,day2_open,day2_close,day3_open,day3_close,day4_open,day4_close,day5_open,day5_close,day6_open,day6_open,day7_open,day7_close
