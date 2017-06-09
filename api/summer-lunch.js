---
layout: null
---
var locations = [

{% assign data_collection = site.collections | where: "label", "summer-lunch" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}

];
