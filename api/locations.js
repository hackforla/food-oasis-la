---
layout: 
---

var locations = [

{% assign data_list = site.data['generated-locations-for-jekyll'] %}
{% for data in data_list %}
{
	latitude  : "{{ data.latitude }}",
	longitude : "{{ data.longitude }}",
	name      : "{{ data.name }}",
	address_1 : "{{ data.address_1 | replace: '"', '' }}",
	category  : "{{ data.category }}",
	hours     : "{{ data.hours }}",
	uri       : "{{ data.uri }}"
}{% unless forloop.last %},{% endunless %}
{% endfor %}

];
