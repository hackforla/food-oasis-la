---
layout: null
---
var locations = [

{% assign data_collection = site.collections | where: "label", "food-pantry" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}
,
{% assign data_collection = site.collections | where: "label", "farmers-market" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}
,
{% assign data_collection = site.collections | where: "label", "community-garden" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}
,
{% assign data_collection = site.collections | where: "label", "supermarket" | first %}
{% assign data_list = data_collection.docs %}
{% include api-list.html %}

];
