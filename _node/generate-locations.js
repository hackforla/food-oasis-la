
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

}

generateCollection('community-gardens');
generateCollection('food-pantries');
generateCollection('farmers-markets');

// TODO: Fetch data from the API, in lieu of the _data folder: https://fola-staging.herokuapp.com/locations
// http://stackoverflow.com/questions/20304862/nodejs-httpget-to-a-url-with-json-response#20305118
var url = "https://fola-staging.herokuapp.com/locations";

request({
  url: url,
  json: true
}, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var writePath = '../_community-gardens-from-staging-api';
    for (let index = 0; index < body.length; index++) {
      createMarkdownFile(writePath, body[index]);
    }
  }
});
