
'use strict';

let fs = require('fs');
let yaml = require('js-yaml');
let mkdirp = require('mkdirp');

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
  let writePath = '../' + uri;

  // For the number of pages needed for the list of records
    // Write the next page

  let pageNumber = 0;
  for (let index = 0; index < size; index += ITEMS_PER_PAGE) {
    pageNumber++;
    createPageFile(writePath, pageNumber, name, uri, size, color);
  }
}



// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

    let filesystem = require("fs");
    let results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        let stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};

function updatePages(name, uri, color) {
  let locations = getAllFilesFromFolder('../_' + uri);
  generatePages(name, uri, locations.length, color);
  return locations.length;
}

let totalLocationsSize = 0;

totalLocationsSize += updatePages('Community Gardens', 'community-garden', 'lime');
totalLocationsSize += updatePages('Food Pantries', 'food-pantry', 'canteloupe');
totalLocationsSize += updatePages('Farmers’ Markets', 'farmers-market', 'strawberry');
totalLocationsSize += updatePages('Supermarkets', 'supermarket', 'strawberry');
totalLocationsSize += updatePages('Summer Lunch', 'summer-lunch', 'canteloupe');

generatePages('Healthy Food', 'locations', totalLocationsSize + getAllFilesFromFolder('../_locations'), 'lime');
