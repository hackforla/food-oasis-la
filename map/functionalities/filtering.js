var fbClicked = true; 
	function foodBankFilter() {
		var fb = document.getElementsByClassName("food-bank-marker")
		if(fbClicked === true) {
			for(var i = 0; i < fb.length; i++) {
				fb[i].style.visibility = "hidden";
			}
			fbClicked = false; 
		} else {
			for(var i = 0; i < fb.length; i++) {
				fb[i].style.visibility = "visible";
			fbClicked = true;
			}
		}
	}

	var fmClicked = true; 
	function farmersMarketFilter() {
		var fm = document.getElementsByClassName("farmers-market-marker");
		if(fmClicked === true) {
			for(var i = 0; i < fm.length; i++) {
				fm[i].style.visibility = "hidden";
			}
			fmClicked = false;
		} else {
			for(var i = 0; i < fm.length; i++) {
				fm[i].style.visibility = "visible";
			}
			fmClicked = true;
		}
	}

	var cgClicked = true; 
	function communityGardenFilter() {
		var cm = document.getElementsByClassName("community-garden-marker");
		if(cgClicked === true){
			for(var i = 0; i < cm.length; i++) {
				cm[i].style.visibility = "hidden";
			}
			cgClicked = false;
		} else {
			for(var i = 0; i < cm.length; i++) {
				cm[i].style.visibility = "visible";
			}
			cgClicked = true;
		}
	}

	var smClicked = true; 
	function supermarketFilter() {
		var sm = document.getElementsByClassName("supermarket-marker");
		if(sgClicked === true){
			for(var i = 0; i < sm.length; i++) {
				sm[i].style.visibility = "hidden";
			}
			sgClicked = false;
		} else {
			for(var i = 0; i < sm.length; i++) {
				sm[i].style.visibility = "visible";
			}
			sgClicked = true;
		}
	}
