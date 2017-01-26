
'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var parse = require('csv-parse/lib/sync');
var yaml = require('js-yaml');

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

function generateCollection(data_name) {

  var input = fs.readFileSync('../_data/' + data_name + '.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  var records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api
  for (let index = 0; index < records.length; index++) {

    (function(food_source) {

      // Page title
      food_source.title = food_source.name + ', Food Oasis Los Angeles';

      // This is duplicated in /assests/js/map.js
      var path = '../_' + data_name;
      var filename = stringToURI(food_source.name.replace(' ' + food_source.category, ''));

       // https://www.npmjs.com/package/js-yaml#safedump-object---options-
      var output =
`---
${yaml.safeDump(food_source)}
---
`
      // console.log(output);
      console.log(path + '/' +  filename + '.md');

      mkdirp(path, function (err) {
        if (err) {
          console.error(err);
        } else {
          fs.writeFileSync(path + '/' +  filename + '.md', output, 'utf8', (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
    });


    })(records[index]);
  }

}

generateCollection('community-gardens');
generateCollection('food-pantries');
generateCollection('farmers-markets');
