
'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var request = require("request");

var UPDATE_LIMIT = 100;

function getYaml(text, filename) {
  var DELIMITER = '---';
  var items = text.split('---');
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
  var DELIMITER = '---';
  var items = text.split('---');
  if (items.length === 3) {
    return items[2];
  } else {
    console.log('unexpected markdown format detected');
    console.log(items.length);
    console.log(text);
  }
}

function loadMarkdown(filename) {
  var input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    var text = fs.readFileSync(filename, 'utf8');
    var yamlText = getYaml(text, filename);
    var contentText = getContent(text, filename);

    if (!yamlText || !contentText) return;

    var data = {}
    data.yaml = yaml.safeLoad(yamlText);
    data.content = contentText;
    return data;

  } catch (e) {
    console.log(e);
  }
}

function saveMarkdown(filename, data) {

  //console.dir(data);

   // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  var output =
`---
${yaml.safeDump(data.yaml)}
---
${data.content}
`

//console.log(output);
//return;

  fs.writeFileSync(filename, output, 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });
}

var updateCount = 0;
function processFile(filename) {

  // Load the contents of the file
  var data = loadMarkdown(filename);
  if (!data) return;

  // If the city name is blank
  if (!data.yaml.city || data.yaml.city === '') {

    if (data.yaml.zip) {

      updateCount++;

      // Look up the missing city name and add it to the data
      getCityNameFromZip(data.yaml)
      .then(function(city) {

        if (!city) {
          console.log('Couldn’t get city from: ' + data.yaml);
          return;
        }

        data.yaml.city = city;

        // Save the file
        saveMarkdown(filename, data);

      }).catch(function(errorMessage) {
        console.log(errorMessage);
      });

    } else {
      console.log('missing zip code…' + locations[index]);
    }

  }
}

function getCityNameFromZip(data) {
  return new Promise(function(succeed, fail) {

    // FOLA’s Mapbox Access Token
    var MAP_ACCESS_TOKEN = 'pk.eyJ1IjoiZm9vZG9hc2lzbGEiLCJhIjoiY2l0ZjdudnN4MDhpYzJvbXlpb3IyOHg2OSJ9.POBdqXF5EIsGwfEzCm8Y3Q';

    var MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + data.longitude + ',' + data.latitude + '.json?limit=1&access_token=' + MAP_ACCESS_TOKEN;

    request({
      url: MAPBOX_URL,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        //console.log(body.features[0]);

        var context = body.features[0].context;
        for (let index = 0; index < context.length; index++) {
          if (context[index].id.indexOf('place') >= 0) {
            // console.log(context[index].text);
            succeed(context[index].text);
          }
        }

      } else {
        fail(new Error("Network error"));
      }
    });

  });
}

// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};

function updateLocations(folder) {
  var locations = getAllFilesFromFolder(folder);

  //console.log(locations);

  // For each location file
  for (let index = 0; index < locations.length; index++) {
    if (updateCount > UPDATE_LIMIT) {
      console.log('update limit reached');
      return;
    }

    processFile(folder + '/' + locations[index]);
  }
}

updateLocations('../_community-garden');
updateLocations('../_farmers-market');
updateLocations('../_food-pantry');
updateLocations('../_supermarket');

