// CURRENT SETUP FOR TESTING ON STAGING SITE:
// GitHub OAuth app points to http://staging.foodoasis.la/add/
// Gatekeeper hosted at https://jimchat-learntocode.herokuapp.com/

// For testing, we'll use this as the master repo:
var GITHUB_REPO = 'site';
var GITHUB_OWNER = 'foodoasisla';
var GATEKEEPER_URL = 'https://foodoasisla-gatekeeper.herokuapp.com/authenticate/';

// VARIABLES FOR CURRENT USER:
var gitHubAccessToken;	
var userName;
var userProfileLink;
var userPhoto;
var userForkedRepoName;
var pullRequestLink;

// VARIABLES FOR GIT COMMIT PROCESS
var pullRequestTitle = "Suggesting New Location: "; // for testing!
var pullRequestBody = '';
var notesFileSha;
var newCommitSha;

// Elements and user input:
var messageSection = document.getElementById("messageSection");
var loginSection = document.getElementById("loginSection");
var inputSection = document.getElementById("inputSection");
var userNameSpan = document.getElementById("userNameSpan");

// Get the temporary GitHub code from URL params, as in ?code=gitHubTemporaryCodeHere
var gitHubTemporaryCodeArray = window.location.href.match(/\?code=(.*)/);

// If code exists (meaning the user clicked the login button, gave access in GitHub, and was redirected):
if (gitHubTemporaryCodeArray) {
  console.log('gitHubTemporaryCodeArray: ' + gitHubTemporaryCodeArray);
  // Hide login section if user has started the login process
  loginSection.classList.add('hidden');

  // Display loading message
  messageSection.classList.remove('hidden');
  messageSection.innerHTML = "<p><em>...Loading...</em></p>";

  // Step 1: Authenticate the user with GitHub
  // (Gatekeeper exchanges temporary code for an access token, using the stored client ID and client secret)
  get(GATEKEEPER_URL + gitHubTemporaryCodeArray[1])
  .then(JSON.parse).then(function (authResponse){
    console.log('Authentication response from Gatekeeper:\n');
    console.log(authResponse);
  
    // Save the access token for later API calls!
    gitHubAccessToken = authResponse.token;

    // Step 2: Fork the base repo
    return postWithToken('https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/forks', {}, gitHubAccessToken)
  
  }).then(JSON.parse).then(function (forkResponse){
    console.log('GitHub response after forking the base repo:\n');
    console.log(forkResponse);

    // Hide the "loading" message when done authenticating and forking
    messageSection.classList.add('hidden');

    // Save username and name of newly-forked repo
    userName = forkResponse.owner.login;
    userProfileLink = forkResponse.owner.html_url;
    userPhoto = forkResponse.owner.avatar_url;
    userForkedRepoName = forkResponse.name;

    // Display username
    userNameSpan.textContent = userName;
    // Display inputSection
    inputSection.classList.remove('hidden');

  }).catch(logAndDisplayError);

}

function submitToGitHub(e) {
  e.preventDefault();

  // If user hasn't signed in first, notify user to do so before submitting notes!
  if (!gitHubAccessToken) {    
  	messageSection.innerHTML = "<p><strong>Please log in with GitHub first! Then you can submit your suggestion.</strong></p>";
  	return;	// Exit from this function, skipping the code below
  }

  // Get user input
  var userText = document.getElementById("userText").value;
  var locationTitle = document.getElementById("locationTitle").value;
  var locationCategory = document.getElementById("locationCategory").value;
  var locationAddress1 = document.getElementById("locationAddress1").value;
  var locationAddress2 = document.getElementById("locationAddress2").value;
  var locationCity = document.getElementById("locationCity").value;
  var locationZip = document.getElementById("locationZip").value;
  var locationWebsite = document.getElementById("locationWebsite").value;
  var locationPhone = document.getElementById("locationPhone").value;
	
  pullRequestTitle += locationTitle;
	
  var folderName = 'locations';
  if (locationCategory && locationCategory != '') {
    folderName = String(locationCategory.replace(/[^a-z0-9]/gi, '-').toLowerCase());
  }

  // Convert to safe (well, safe ENOUGH for now) file name. ❤️
  // via https://stackoverflow.com/questions/8485027/javascript-url-safe-filename-safe-string  
  var newFileName = '_' + folderName + '/' + locationTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.md';

  // Display loading message
  messageSection.innerHTML = "<p><em>...Loading...</em></p>";
  messageSection.classList.remove('hidden');

  var latitude = '';
  var longitude = '';

  var addressForGeocoding = locationAddress1 + ' ' + locationAddress2 + ' ' + locationCity + ' California ' + locationZip;

  var MAP_ACCESS_TOKEN = 'pk.eyJ1IjoiZm9vZG9hc2lzbGEiLCJhIjoiY2l0ZjdudnN4MDhpYzJvbXlpb3IyOHg2OSJ9.POBdqXF5EIsGwfEzCm8Y3Q';

  var MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(addressForGeocoding) + '.json?limit=1&access_token=' + MAP_ACCESS_TOKEN;

  get(MAPBOX_URL)
  .then(JSON.parse).then(function (mapboxResponse){
    longitude = mapboxResponse.features[0].center[0];
    latitude  = mapboxResponse.features[0].center[1];
    doTheRest();
  }).catch(logAndDisplayError);

  /*
  var client = new MapboxClient(MAP_ACCESS_TOKEN);
  client.geocodeForward(addressForGeocoding, function(err, data, res) {
    // data is the geocoding result as parsed JSON
    // res is the http response, including: status, headers and entity properties
    var latitude  = data.features[0].center[0];
    var longitude = data.features[0].center[1];
    doTheRest();
   });
   */

function doTheRest() {

  // Create and format content for new file with user input
  var fileContents =
  '---' + '\r\n' + 
  'name: ' + locationTitle + '\r\n' + 
  'address_1: ' + locationAddress1 + '\r\n' + 
  'address_2: ' + locationAddress2 + '\r\n' + 
  'city: ' + locationCity + '\r\n' + 
  'state: CA' + '\r\n' + 
  'zip: ' + locationZip + '\r\n' + 
  'latitude: ' + latitude + '\r\n' + 
  'longitude: ' + longitude + '\r\n' + 
  'category: ' + locationCategory + '\r\n' + 
  'website: ' + locationWebsite + '\r\n' + 
  'phone: ' + locationPhone + '\r\n' + 
  'title: ' + locationTitle + ', Food Oasis Los Angeles' + '\r\n' + 
  'uri: ' + '/' + folderName + '/' + locationTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '/' + '\r\n' + 
  '---' + '\r\n' + 
  + '\r\n' + 
  userText + '\r\n';

  // Encode into base64, and convert the string to ASCII
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
  fileContents = window.btoa(unescape(encodeURIComponent(fileContents)));
  
  var updateFileData = {"path": newFileName, "message": pullRequestTitle, "content": fileContents};      

  // Step 3: Commit to the repo, creating new file
  postWithToken('https://api.github.com/repos/' + userName + '/' + userForkedRepoName + '/contents/' + newFileName, updateFileData, gitHubAccessToken, "PUT")
  .then(JSON.parse).then(function (updateResponse){
    console.log('GitHub response after creating the file:\n');
    console.log(updateResponse);
    
    // Step 4: Create a new pull request
    var pullRequestData = {"title": pullRequestTitle, "body": pullRequestBody, "base": "master", "head": userName + ":master"};
    return postWithToken('https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/pulls', pullRequestData, gitHubAccessToken);

  }).then(JSON.parse).then(function (pullResponse){
    console.log('GitHub response after creating the pull request:\n');
    console.log(pullResponse);
    
    // If a new pull request was successfully created, save its public link
    if (pullResponse.html_url) {
      pullRequestLink = pullResponse.html_url;
    }

    // Step 5: Display success message with link to pull request
    messageSection.classList.remove('hidden');
  	messageSection.innerHTML = '<h1>Thanks! Your suggestion has been submitted!</h1><p><a href="' + pullRequestLink + '">View your suggestion on GitHub here!</a><br />Once approved, your suggestion will appear on our map.</p>';    

    // TODO: Prevent "pull request already exists" error?

  }).catch(logAndDisplayError); // Log error to console and display on the web page too

}

} // end of submitToGitHub function

// When user clicks "submit" button, post to GitHub!
document.getElementById('addForm').addEventListener('submit', submitToGitHub);

function logAndDisplayError (errorMessage) {
	console.log(errorMessage);
  messageSection.classList.remove('hidden');
	messageSection.innerHTML = '<p><strong>' + errorMessage + '</strong></p><p class="action"><a href="/add/">Start Over</a></p>';
}

/* -------------------------------------------------
	HELPER FUNCTIONS
---------------------------------------------------- */

// Returns a promise, as a simple wrapper around XMLHTTPRequest
// via http://eloquentjavascript.net/17_http.html
function get(url) {
  return new Promise(function(succeed, fail) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.addEventListener("load", function() {
      if (req.status < 400)
        succeed(req.responseText);
      else
        fail(new Error("Request failed: " + req.statusText));
    });
    req.addEventListener("error", function() {
      fail(new Error("Network error"));
    });
    req.send(null);
  });
}

function getWithCustomHeader(url, customHeader) {
  return new Promise(function(succeed, fail) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    
    req.setRequestHeader('Accept', 'application/vnd.github.v3.html');

    req.addEventListener("load", function() {
      if (req.status < 400)
        succeed(req.responseText);
      else
        fail(new Error("Request failed: " + req.statusText));
    });
    req.addEventListener("error", function() {
      fail(new Error("Network error"));
    });
    req.send(null);
  });
}

// Returns a promise for a POST request
function postWithToken(url, postDataObject, accessToken, method) {
  return new Promise(function(succeed, fail) {
    var req = new XMLHttpRequest();    

    req.open(method || "POST", url, true);
    
    // Set header for POST, like sending form data
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // Set header for GitHub auth
    req.setRequestHeader('Authorization', 'token ' + accessToken);

    req.addEventListener("load", function() {
      // NOTE: Exception for "A pull request already exists" 422 error!
      if (req.status < 400 || ( req.status == 422 && JSON.parse(req.responseText).errors[0].message.includes("A pull request already exists") ) ) {
        succeed(req.responseText);
      } else {
        fail(new Error("Request failed: " + req.statusText));
      }
    });
    req.addEventListener("error", function() {
      fail(new Error("Network error"));
    });      

    req.send(JSON.stringify(postDataObject));
  });
}
