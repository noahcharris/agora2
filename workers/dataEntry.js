var pg = require('pg');
var fs = require('fs');

var conString = 'postgres://keybornCat:prairiePiratesPicnic@agora-production-server.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/mahDb';
// var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://noahharris@localhost:5432/noahharris';

var client = new pg.Client(conString);
client.connect();

var countryData = require('../client/resources/newCountries.js');
var cityData = require('../client/resources/cities.js');
var statesData = require('../client/resources/us-states.js');
var channelData = require('../client/resources/channels.js');

// countries = countryData.countries.features;
// cities = cityData.cities.features;
// states = statesData.states.features;
// channels = channelData.channels;

countries = [];
cities = [];
states = [];
channels = [];




function addCity(name, parent, lat, long) {

  client.query("INSERT INTO locations (type, isUserCreated, name, parent, latitude, longitude, pointGeometry, isCity, image, hasStates) "
    +"VALUES ('Location', 'false', $1, $2, $3, $4, ST_GeomFromText('POINT("+long+" "+lat+")', 4269), 'true', 'https://s3-us-west-2.amazonaws.com/agora-static-storage/defaultlocation.jpg', 'false');", [name, parent, lat, long],
    function(err, result) {
      if (err) {
        throw err;
      } else {
        console.log('added city');
      }

  });


};

// addCity('World/United States/Kentucky/Lexington', 'World/United States/Kentucky', 38.0297, -84.4947);
addCity('World/United States/California/Oakland', 'World/United States/California', 37.8044, -122.2708);






//INSERT WORLD
// client.query("INSERT INTO locations (type, isusercreated, isCountry, isState, isCity, name, population, public, image) "
//   +"VALUES ('Location', false, false, false, false, $1, 0, true, 'https://s3-us-west-2.amazonaws.com/agora-static-storage/defaultlocation.jpg');",
//   ['World'],
//   function(err, result) {
//     if (err) {
//       console.log('error inserting into locations: ', err);
//     } else {
//       console.log('inserted world');

//     }
// });



//INSERT COUNTRIES
for (var i=0; i < countries.length ;i++) {

  client.query("INSERT INTO locations (type, parent, isusercreated, isCountry, isState, isCity, name, population, public, image, hasStates) "
    +"VALUES ('Location', 'World', 'false', 'true', 'false', 'false', $1, 0, 'true', 'https://s3-us-west-2.amazonaws.com/agora-static-storage/defaultlocation.jpg', false);",
    [countries[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted country');

      }
  });




};



//INSERT CITIES
for (var i=0; i < cities.length ;i++) {

  var parent = cities[i].properties.city.split('/').slice(0, cities[i].properties.city.split('/').length - 1).join('/');

  if (parent === 'World')
    continue;

  client.query("INSERT INTO locations (type, parent, isusercreated, isCountry, isState, isCity, name, population, public, latitude, longitude, pointGeometry, image) "
    +"VALUES ('Location',$2 , false, false, false, true, $1, 0, true, "+cities[i].geometry.coordinates[1]+", "+cities[i].geometry.coordinates[0]+", ST_GeomFromText('POINT("+cities[i].geometry.coordinates[0]+" "+cities[i].geometry.coordinates[1]+")', 4269), 'https://s3-us-west-2.amazonaws.com/agora-static-storage/defaultlocation.jpg');",
    [cities[i].properties.city, parent],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted city');
      }
  });

  






};



//INSERT STATES
for (var i=0; i < states.length ;i++) {

  client.query("INSERT INTO locations (type, isusercreated, isCountry, isState, isCity, name, population, public, parent, image) "
    +"VALUES ('Location', false, false, true, false, $1, 0, true, 'World/United States', 'https://s3-us-west-2.amazonaws.com/agora-static-storage/defaultlocation.jpg');",
    [states[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted state');
      }
  });



};





//CHANNELS

// client.query("UPDATE topics SET channel='All' WHERE channel = 'General';", function() {

// });



// for (var i=0; i < channels.length ;i++) {

//   client.query("INSERT INTO channels (type, name) "
//     +"VALUES ('Channel', $1);",
//     [channels[i].name],
//     function(err, result) {
//       if (err) {
//         console.log('error inserting into channels: ', err);
//       } else {
//         console.log('what?');
//       }
//   });


// };
// console.log('finished inserting channels');



//process.exit();

console.log('issued queries');



