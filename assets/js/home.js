
(function() {

	/* OPTIONAL: Show a random image behind the introduction
	----------------------------------------------- */
	let images = [
		'/assets/images/photos/daily-organics/1.jpg',
		'/assets/images/photos/daily-organics/2.jpg',
		'/assets/images/photos/santa-monica/1.jpg',
		'/assets/images/photos/santa-monica/2.jpg',
		'/assets/images/photos/santa-monica/3.jpg',
		'/assets/images/photos/santa-monica/4.jpg',
		'/assets/images/photos/santa-monica/5.jpg',
		'/assets/images/photos/santa-monica/6.jpg',
		'/assets/images/photos/santa-monica/7.jpg',
		'/assets/images/photos/santa-monica/8.jpg',
		'/assets/images/photos/santa-monica/9.jpg',
		'/assets/images/photos/santa-monica/10.jpg',
		'/assets/images/photos/santa-monica/11.jpg',
		'/assets/images/photos/santa-monica/12.jpg',
		'/assets/images/photos/santa-monica/13.jpg',
		'/assets/images/photos/santa-monica/14.jpg',
		'/assets/images/photos/santa-monica/15.jpg',
		'/assets/images/photos/santa-monica/16.jpg',
		'/assets/images/photos/santa-monica/17.jpg'
	];
	let min = 0;
	let max = images.length - 1;
	let random = Math.floor(Math.random() * (max - min + 1) + min);
	let introduction = document.querySelector('.introduction');
	introduction.style.backgroundImage = 'url(' + images[random] + ')';

	let template = document.getElementById('photo-credit-template');
	introduction.insertAdjacentHTML('beforeend', template.innerHTML);
	let creditLink = document.querySelector('.photo-credit a');

	let data = {
		'santa-monica': {
			url: '/farmers-market/santa-monica-downtown/',
			name: 'Santa Monica Farmers’ Market'
		},
		'daily-organics': {
			url: '/locations/daily-organics/',
			name: 'Daily Organics'
		}
	}

	let id = (images[random].indexOf('santa-monica') >= 0) ? 'santa-monica' : 'daily-organics';

	creditLink.textContent = data[id].name;
	creditLink.href        = data[id].url;

})();


(function() {

	/* OPTIONAL: Add a class name of “scrolled-up” to the body if the introduction (including the logo) is visible.
	----------------------------------------------- */

	if (!('addEventListener' in window) || !('scrollY' in window) || !('classList' in document.body)) return; // Do we have the features we need?

	function update(e) {
		if (window.scrollY < 300) {
			document.body.classList.add('scrolled-up');
		} else {
			document.body.classList.remove('scrolled-up');
		}
	}

	update();

	(function() {
		let throttle;
		window.addEventListener('scroll', function() {
			if (throttle) clearTimeout(throttle);
			throttle = setTimeout(update, 10);
		}, false);
	})();


	/* OPTIONAL: Handle slow loading content and resizing windows.
	----------------------------------------------- */
	window.addEventListener('load', update, false);

	(function() {
		let throttle;
		window.addEventListener('resize', function() {
			if (throttle) clearTimeout(throttle);
			throttle = setTimeout(update, 100);
		}, false);
	})();

})();
