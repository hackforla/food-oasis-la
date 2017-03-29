---
layout: null
---
var locations = [

{% assign data_collection = site.collections | where: "label", "community-garden" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}

];
