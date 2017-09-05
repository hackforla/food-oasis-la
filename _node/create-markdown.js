
'use strict';

let fs = require('fs');
let mkdirp = require('mkdirp');
let parse = require('csv-parse/lib/sync');
let yaml = require('js-yaml');
let request = require("request");

// This is duplicated in /assests/js/map.js
function stringToURI(str) {
  return String(str).toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/\&/g, '-')
    .replace(/\./g, '-')
    .replace(/\:/g, '-')
    .replace(/\,/g, "-")
    .replace(/\+/g, "-")
    .replace(/\r\n?/, '-')  
    .replace(/\'/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\-\-\-\-/g, '-')
    .replace(/\-\-\-/g, '-')
    .replace(/\-\-/g, '-')
    .replace(' ', '');
}

function formatTime(timeString) { // Example: 1430 ==> 2:30pm; 0900 ==> 9:00am
  let hours   = Number(timeString.substring(0, timeString.length - 2));
  let minutes = timeString.substring(timeString.length - 2);
  let ampm = 'am';
  if (hours >= 12 && hours < 24) {
    ampm = 'pm';
  }
  if (hours >= 13) {
    hours = hours - 12;
  }
  return hours + ((minutes != '00') ? ":" + minutes : '') + ampm;
}

function createMarkdownFile(writePath, data, category_uri) {

  // Page title
  data.title = data.name + ', Food Oasis Los Angeles';

  let filename = data.name.replace(' ' + data.category, '');

  if (category_uri === 'supermarket') {
    filename += '-' + data.address_1;
  }

  filename = stringToURI(filename);

  data.uri = '/' + category_uri + '/' + filename + '/';

// loop thru days 1 - 7
  for (let i = 1; i <= 7; i++) {
    // replace hardcoded day1 & daycode 1 with __i
    let daycodeKey = 'daycode' + i;
    let formattedKey = 'formatted_daycode' + i;
    let openKey = 'day' + i + '_open';
    let closeKey = 'day' + i + '_close';

    if (data[ daycodeKey ] && data[ openKey ] && data[ closeKey ] ) {
      switch (data[ daycodeKey ].trim().toLowerCase()) {
        case 'mon':
          data[formattedKey] = 'Monday';
          break;
        case 'tue':
          data[formattedKey] = 'Tuesday';
          break;
        case 'wed':
          data[formattedKey] = 'Wednesday';
          break;
        case 'thu':
          data[formattedKey] = 'Thursday';
          break;
        case 'fri':
          data[formattedKey] = 'Friday';
          break;
        case 'sat':
          data[formattedKey] = 'Saturday';
          break;
        case 'sun':
          data[formattedKey] = 'Sunday';
          break;
      }
      data['formatted_day' + i + '_open']  = formatTime(data[ openKey ]);
      data['formatted_day' + i + '_close'] = formatTime(data[ closeKey ]);
    }
  }

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---
`

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' +  filename + '.md', output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function generateCollection(data_name, data_category) {

  console.log('data name: ' + data_name);

  let writePath = './_' + data_name; // Example: _/community-gardens
  let input = fs.readFileSync('./_data/' + data_name + '.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api
  for (let index = 0; index < records.length; index++) {
    records[index].category = data_category;
    createMarkdownFile(writePath, records[index], data_name);
  }
  return records;
}

let ITEMS_PER_PAGE = 20;
function createPageFile(writePath, pageNumber, name, uri, size, color) {

  // Page title
  let data = {
    layout: 'location-list',
    color: color,
    title: name + ' in Los Angeles' + (pageNumber > 1 ? ', Page ' + pageNumber : ''),
    page_number: pageNumber,
    items_per_page: ITEMS_PER_PAGE,
    list_offset: (pageNumber - 1) * ITEMS_PER_PAGE,
    first: '/' + uri + '/',
    canonical_url: '/' + uri + '/'
  };

  if ((data.list_offset + ITEMS_PER_PAGE) < size) {
    data.next = '/' + uri + '/page' + (pageNumber + 1) + '/';
  }

  if (pageNumber > 2) {
    data.previous = '/' + uri + '/page' + (pageNumber - 1) + '/';
  } else if (pageNumber === 2) {
    data.previous = data.first;
  }

  if (uri !== 'locations') {
    data.collection = uri;
  }

  data.category = name;

  let filename = (pageNumber === 1) ? 'index.md' : 'page' + pageNumber + '.md'; // Example page2.md

   // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---
`

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' +  filename, output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function generatePages(name, uri, size, color) {
  let writePath = './' + uri;

  // For the number of pages needed for the list of records
    // Write the next page

  let pageNumber = 0;
  for (let index = 0; index < size; index += ITEMS_PER_PAGE) {
    pageNumber++;
    createPageFile(writePath, pageNumber, name, uri, size, color);
  }
}

/*
let communityGardens = generateCollection('community-garden', 'Community Garden');
let foodPantries     = generateCollection('food-pantry', 'Food Pantry');
let farmersMarkets   = generateCollection('farmers-market', 'Farmers Market');
let supermarkets     = generateCollection('supermarket', 'Supermarket');
let summerLunches    = generateCollection('summer-lunch', 'Summer Lunch');
*/

/*
generatePages('Healthy Food', 'locations', communityGardens.length + foodPantries.length + farmersMarkets.length, 'lime');
generatePages('Community Gardens', 'community-garden', communityGardens.length, 'lime');
generatePages('Food Pantries', 'food-pantry', foodPantries.length, 'canteloupe');
generatePages('Farmers’ Markets', 'farmers-market', farmersMarkets.length, 'strawberry');
generatePages('Supermarkets', 'supermarket', supermarkets.length, 'strawberry');
generatePages('Summer Lunch', 'summer-lunch', summerLunches.length, 'canteloupe');
*/

/*
function generateLocationJSON() {
  let writePath = './_data';

  let locations = communityGardens.concat(foodPantries.concat(farmersMarkets.concat(supermarkets)));
  locations = locations.sort(function(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  let output = JSON.stringify(locations);

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' + 'generated-locations-for-jekyll.json', output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}
*/

// generateLocationJSON(communityGardens.concat(foodPantries.concat(farmersMarkets.concat(supermarkets))), 'generated-locations-for-jekyll.json');

// TODO: Fetch data from the API, in lieu of the _data folder: https://fola-staging.herokuapp.com/locations
// http://stackoverflow.com/questions/20304862/nodejs-httpget-to-a-url-with-json-response#20305118
/*
let url = "https://fola-staging.herokuapp.com/locations";

request({
  url: url,
  json: true
}, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    let writePath = './_community-garden-from-staging-api';
    for (let index = 0; index < body.length; index++) {
      createMarkdownFile(writePath, body[index], 'community-garden-from-staging-api');
    }
    let communityGardensFromStagingAPI = body;
    generatePages('Community Gardens from Staging API', 'community-garden-from-staging-api', communityGardens.length, 'lime');
    generateLocationJSON(communityGardensFromStagingAPI, 'generated-locations-from-staging-api-for-jekyll.json');
  }
});
*/
