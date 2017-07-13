---
layout: default
title: Add Healthy Food Location, Food Oasis Los Angeles
---

<section class="success" role="status" id="messageSection">
  <h1>Thanks! Your suggestion has been submitted!</h1>
  <p>
    Once approved, your suggestion will appear on our map.
  </p>
</section>

<template id="link-template">
  <p><a href="">View your suggestion on GitHub here!</a></p>
</template>

<script>
// Test to see if the browser supports the HTML template element by checking
// for the presence of the template element's content attribute.
// KUDOS: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
if ('content' in document.createElement('template')) {

	var pr_link = window.location.href.match(/\?pr_link=(.*)/)[1];
	if (pr_link) {
	  var template = document.getElementById('link-template');

	  var link = template.content.querySelector('a');
	  link.setAttribute('href', pr_link);

	  var clone = document.importNode(template.content, true);

	  var messageSection = document.getElementById('messageSection');
	  messageSection.insertBefore(clone, messageSection.querySelector('p'));
	}
}

</script>

{% include add-form.html %}
