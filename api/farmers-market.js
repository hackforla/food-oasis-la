---
layout: null
---
var locations = [

{% assign data_collection = site.collections | where: "label", "farmers-market" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}

];
