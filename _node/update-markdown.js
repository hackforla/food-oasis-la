
'use strict';

let fs = require('fs');
let yaml = require('js-yaml');
let request = require("request");

const UPDATE_LIMIT = 100;

// FOLA’s Mapbox Access Token
const MAP_ACCESS_TOKEN = 'pk.eyJ1IjoiZm9vZG9hc2lzbGEiLCJhIjoiY2l0ZjdudnN4MDhpYzJvbXlpb3IyOHg2OSJ9.POBdqXF5EIsGwfEzCm8Y3Q';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

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

function saveMarkdown(filename, data) {
  // console.log('filename')
  // console.log(filename);

  // console.dir(data);

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
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

function addMissingLatitude(data) {
  return new Promise(function(succeed, fail) {

    // If the latitude or longitude is blank
    if (!data.yaml.latitude || data.yaml.latitude === '' || !data.yaml.longitude || data.yaml.longitude === '') {

      // If the address and zip code are not blank
      if (data.yaml.address_1 && data.yaml.address_1 != '' && data.yaml.zip && data.yaml.zip != '') {

        updateCount++;

        // Look up the missing latitude and longitude and add them to the data
        getLatitudeFromAddress(data.yaml)
        .then(function(coordinates) {

          if (!coordinates) {
            fail(new Error('Couldn’t get latitude from: ' + data.yaml));
            return;
          }

          data.yaml.latitude = coordinates.latitude;
          data.yaml.longitude = coordinates.longitude;

          succeed(data);

        }).catch(function(errorMessage) {
          fail(errorMessage);
        });

      } else {
        fail(new Error('Couldn’t get latitude due to missing address or zip code…' + locations[index]));
        return;
      } // If the address and zip code are not blank

    } // If the latitude or longitude is blank

  });
}

function addMissingCity(data) {
  return new Promise(function(succeed, fail) {

    // If the city name is blank
    if (!data.yaml.city || data.yaml.city === '') {

      // If the latitude and longitude are not blank
      if (data.yaml.latitude && data.yaml.latitude != '' && data.yaml.longitude && data.yaml.longitude != '') {

        updateCount++;

        // Look up the missing city name and add it to the data
        getCityNameFromLatitude(data.yaml)
        .then(function(city) {

          if (!city) {
            fail(new Error('Couldn’t get city from: ' + data.yaml));
            return;
          }

          data.yaml.city = city;

          succeed(data);

        }).catch(function(errorMessage) {
          fail(errorMessage);
        });

      } else {
        fail(new Error('Couldn’t get city due to missing longitude or latitude…' + locations[index]));
        return;
      } // If the latitude and longitude are not blank

    } // If the city name is blank

  });
}

let updateCount = 0;
function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename);
  if (!data) return;

  getAddressFromName(data)
  .then(function() {
    //addMissingLatitude(data)
  })
  .then(function() {
    //addMissingCity(data);
  })
  .then(function() {
    // Save the file
    saveMarkdown(filename, data);
  })
  .catch(function(errorMessage) {
    console.log(errorMessage);
  });

}

function getAddressFromName(data) {
  return new Promise(function(succeed, fail) {

    let addressForGeocoding = data.yaml.name + ', ' + data.yaml.address_1 + ', ' + data.yaml.address_2 + ', ' + data.yaml.city + ', California ' + data.yaml.zip;

    const JIMS_GOOGLE_API_KEY = 'AIzaSyBP5KxqO9v1sLhXlkrG3vDiDdOJvYLJ0H4';

    let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(addressForGeocoding) + '&key=' + JIMS_GOOGLE_API_KEY;

    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200 && body.results[0] && body.results[0].geometry) {

        data.yaml.latitude  = body.results[0].geometry.location.lat;
        data.yaml.longitude = body.results[0].geometry.location.lng;

console.log(
`---
${yaml.safeDump(body)}
---
`);

        let streetNumber;
        let route;
        let neighborhood;
        let locality;
        let address = body.results[0].address_components;
        for (let index = 0; index < address.length; index++) {
          if (address[index].types.join(',').indexOf('street_number') >= 0) {
            streetNumber = address[index].long_name;
          } else if (address[index].types.join(',').indexOf('route') >= 0) {
            route = address[index].long_name;
          } else if (address[index].types.join(',').indexOf('neighborhood') >= 0) {
            neighborhood = address[index].long_name;
          } else if (address[index].types.join(',').indexOf('locality') >= 0) {
            locality = address[index].long_name;
          } else if (address[index].types[0] === 'postal_code') {
            data.yaml.zip = address[index].long_name;
          }
        }

        if (streetNumber && route) {
          data.yaml.address_1 = streetNumber + ' ' + route;
        }

        data.yaml.city = locality; //(neighborhood && neighborhood.indexOf('Los Angeles') < 0 && locality === 'Los Angeles') ? neighborhood : locality;

        succeed();

      } else {
        fail(new Error("error geocoding" + addressForGeocoding));
      }
    });

return;

    let url = MAPBOX_URL + encodeURIComponent(addressForGeocoding) + '.json?limit=1&access_token=' + MAP_ACCESS_TOKEN;

    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {

console.log(
`---
${yaml.safeDump(body)}
---
`);

        if (body.features[0].properties.address) data.yaml.address_1 = body.features[0].properties.address;
        data.yaml.longitude = body.features[0].center[0];
        data.yaml.latitude  = body.features[0].center[1];

        let context = body.features[0].context;
        for (let index = 0; index < context.length; index++) {
          if (context[index].id.indexOf('place') >= 0) {
            data.yaml.city = context[index].text;
          } else if (context[index].id.indexOf('postcode') >= 0) {
            data.yaml.zip = context[index].text;
          }
        }

        succeed();

      } else {
        fail(new Error("Network error"));
      }
    });

  });
}

function getLatitudeFromAddress(data) {
  return new Promise(function(succeed, fail) {

    let addressForGeocoding = data.address_1 + ' ' + data.address_2 + ' ' + data.city + ' California ' + data.zip;

    let url = MAPBOX_URL + encodeURIComponent(addressForGeocoding) + '.json?limit=1&access_token=' + MAP_ACCESS_TOKEN;

    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        succeed({
          longitude: body.features[0].center[0],
          latitude:  body.features[0].center[1]
        });

      } else {
        fail(new Error("Network error"));
      }
    });

  });
}

function getCityNameFromLatitude(data) {
  return new Promise(function(succeed, fail) {

    let url = MAPBOX_URL + data.longitude + ',' + data.latitude + '.json?limit=1&access_token=' + MAP_ACCESS_TOKEN;

    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        //console.log(body.features[0]);

        let context = body.features[0].context;
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

function updateLocations(folder) {
  let locations = getAllFilesFromFolder(folder);

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

//updateLocations('../_community-garden');
//updateLocations('../_farmers-market');
//updateLocations('../_food-pantry');
//updateLocations('../_summer-lunch');
//updateLocations('../_supermarket');

