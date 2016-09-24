function buildLocationList(data) {
	console.log('inside buildlocationlist');
	// Iterate through the list of stores
	for (i = 0; i < data.features.length; i++) {
  var currentFeature = data.features[i];
  // Shorten data.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
  var prop = currentFeature.properties;
  // Select the listing container in the HTML and append a div
    // with the class 'item' for each store
  var listings = document.getElementById('listings');
  var listing = listings.appendChild(document.createElement('div'));
  listing.className = 'item';
  listing.id = "listing-" + i;

  // Create a new link with the class 'title' for each store
  // and fill it with the store address
  var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = prop.name;

  // Create a new div with the class 'details' for each store
  // and fill it with the city and phone number

  var locationAddress = listing.appendChild(document.createElement('div'));
  locationAddress.innerHTML = prop.address;

  // Create a new div with the class 'details' for each store
  // and fill it with the city and phone number
  var details = listing.appendChild(document.createElement('div'));
  var detailsHTML = "";
  if (prop.phone) detailsHTML += "Phone: " + prop.phone;
  if (prop.hours) detailsHTML += (prop.phone ? ' &middot ' : '') + "Hours: " + prop.hours;
  details.innerHTML = detailsHTML;

  // Add an event listener for the links in the sidebar listing
  link.addEventListener('click', function(e){
    // Update the currentFeature to the store associated with the clicked link
    var clickedListing = data.features[this.dataPosition];
    // 1. Fly to the point associated with the clicked link
    flyToStore(clickedListing);
    // 2. Close all other popups and display popup for clicked store
    showPopup(clickedListing);
    // 3. Highlight listing in sidebar (and remove highlight for all other listings)
    var activeItem = document.getElementsByClassName('active-listing-item');
  if (activeItem[0]) {
  activeItem[0].classList.remove('active-listing-item');
    }

    this.parentNode.classList.add('active-listing-item');
  });
    }
}