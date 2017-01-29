
'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var parse = require('csv-parse/lib/sync');
var yaml = require('js-yaml');
var request = require("request")

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
}

function createMarkdownFile(writePath, data) {

  // Page title
  data.title = data.name + ', Food Oasis Los Angeles';

  var filename = stringToURI(data.name.replace(' ' + data.category, ''));

  data.uri = '/' + data.category.toLowerCase().replace(' ', '-') + '/' + filename + '/';

   // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  var output =
`---
${yaml.safeDump(data)}
---
`
  // console.log(writePath + '/' +  filename + '.md');

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

function generateCollection(data_name) {

  var writePath = '../_' + data_name; // Example: _/community-gardens
  var input = fs.readFileSync('../_data/' + data_name + '.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  var records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api
  for (let index = 0; index < records.length; index++) {
    createMarkdownFile(writePath, records[index]);
  }
  return records;
}

var communityGardens = generateCollection('community-garden');
var foodPantries     = generateCollection('food-pantry');
var farmersMarkets   = generateCollection('farmers-market');

var ITEMS_PER_PAGE = 10;
function createPageFile(writePath, pageNumber, name, uri, size, color) {

  // Page title
  var data = {
    layout: 'list',
    color: color,
    title: name + ' in Los Angeles, Page ' + pageNumber,
    page_number: pageNumber,
    items_per_page: ITEMS_PER_PAGE,
    list_offset: (pageNumber - 1) * ITEMS_PER_PAGE,
    first: '/' + uri + '/'
  };

  if ((data.list_offset + ITEMS_PER_PAGE) < size) {
    data.next = '/' + uri + '/page' + (pageNumber + 1) + '/';
  }

  if (pageNumber > 2) {
    data.previous = '/' + uri + '/page' + (pageNumber - 1) + '/';
  } else if (pageNumber === 2) {
    data.previous = data.first;
  }

  if (uri !== 'list') data.collection = uri;

  var filename = (pageNumber === 1) ? 'index.md' : 'page' + pageNumber + '.md'; // Example page2.md

   // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  var output =
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
  var writePath = '../' + uri;

  // For the number of pages needed for the list of records
    // Write the next page

  var pageNumber = 0;
  for (let index = 0; index < size; index += ITEMS_PER_PAGE) {
    pageNumber++;
    createPageFile(writePath, pageNumber, name, uri, size, color);
  }
}

generatePages('Healthy Food', 'list', communityGardens.length + foodPantries.length + farmersMarkets.length, 'lime');
generatePages('Community Gardens', 'community-garden', communityGardens.length, 'lime');
generatePages('Food Pantries', 'food-pantry', foodPantries.length, 'canteloupe');
generatePages('Farmers’ Markets', 'farmers-market', farmersMarkets.length, 'strawberry');

function generateLocationJSON() {
  var writePath = '../_data';

  var locations = communityGardens.concat(foodPantries.concat(farmersMarkets));
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

  var output = JSON.stringify(locations);

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

generateLocationJSON();

/*

// TODO: Fetch data from the API, in lieu of the _data folder: https://fola-staging.herokuapp.com/locations
// http://stackoverflow.com/questions/20304862/nodejs-httpget-to-a-url-with-json-response#20305118
var url = "https://fola-staging.herokuapp.com/locations";

request({
  url: url,
  json: true
}, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var writePath = '../_community-garden-from-staging-api';
    for (let index = 0; index < body.length; index++) {
      createMarkdownFile(writePath, body[index]);
    }
  }
});

*/
