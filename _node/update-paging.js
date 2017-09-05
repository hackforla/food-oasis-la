
'use strict';

let fs = require('fs');
let yaml = require('js-yaml');
let mkdirp = require('mkdirp');

const ITEMS_PER_PAGE = 20;
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
  let locations = getAllFilesFromFolder('./_' + uri);
  generatePages(name, uri, locations.length, color);
  return locations;
}


function getYaml(text, filename) {
  const DELIMITER = '---';
  let items = text.split(DELIMITER);
  if (items.length === 3) {
    return items[1];
  } else {
    console.log('unexpected markdown format detected');
    console.log(items.length);
    console.log(text);
    console.log(filename);
  }
}

function getContent(text, filename) {
  const DELIMITER = '---';
  let items = text.split(DELIMITER);
  if (items.length === 3) {
    return items[2];
  } else {
    console.log('unexpected markdown format detected');
    console.log(items.length);
    console.log(text);
  }
}

function loadMarkdown(filename) {
  let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    let text = fs.readFileSync(filename, 'utf8');
    let yamlText = getYaml(text, filename);
    let contentText = getContent(text, filename);

    if (!yamlText || !contentText) return;

    let data = {}
    data.yaml = yaml.safeLoad(yamlText);
    data.content = contentText;
    return data;

  } catch (e) {
    console.log(e);
  }
}

function generateLocationJSON(locationURIs) {
  let writePath = './_data';

  let locations = [];
  for (let index = 0; index < locationURIs.length; index++) {

    // Load the contents of the file
    let data = loadMarkdown(locationURIs[index]);

    locations.push(data.yaml);
  }

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

  let output = JSON.stringify(locations, null, 4);

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

let communityGardens = updatePages('Community Gardens', 'community-garden', 'lime');
let foodPantries = updatePages('Food Pantries', 'food-pantry', 'canteloupe');
let farmersMarkets = updatePages('Farmers’ Markets', 'farmers-market', 'strawberry');
let supermarkets = updatePages('Supermarkets', 'supermarket', 'strawberry');
let summerLunches = updatePages('Summer Lunch', 'summer-lunch', 'canteloupe');

let miscLocations = getAllFilesFromFolder('./_locations');

let totalSize = 
  communityGardens.length +
  foodPantries.length +
  farmersMarkets.length +
  supermarkets.length +
  summerLunches.length +
  miscLocations.length;

generatePages('Healthy Food', 'locations', totalSize, 'lime');

generateLocationJSON(communityGardens.concat(foodPantries.concat(farmersMarkets.concat(supermarkets.concat(summerLunches.concat(miscLocations))))));
