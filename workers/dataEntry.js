var pg = require('pg');
var fs = require('fs');

var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://noahharris@localhost:5432/noahharris';

var client = new pg.Client(conString);
client.connect();

var countryData = require('../client/resources/newCountries.js');
var cityData = require('../client/resources/cities.js');
var statesData = require('../client/resources/us-states.js');
var channelData = require('../client/resources/channels.js');

countries = countryData.countries.features;
cities = cityData.cities.features;
states = statesData.states.features;
channels = channelData.channels;






function addCity(name, parent, lat, long) {

  client.query("INSERT INTO locations (type, isUserCreated, name, parent, latitude, longitude, isCity) "
    +"VALUES ('Location', 'false', $1, $2, $3, $4, 'true');", [name, parent, lat, long],
    function(err, result) {
      if (err) throw err;
    })

    //TODO alter cities files


};








//INSERT WORLD
client.query("INSERT INTO locations (type, isusercreated, isCountry, isState, isCity, name, population, public) "
  +"VALUES ('Location', false, false, false, false, $1, 0, true);",
  ['World'],
  function(err, result) {
    if (err) {
      console.log('error inserting into locations: ', err);
    } else {
      console.log('inserted world');

    }
});



//INSERT COUNTRIES
for (var i=0; i < countries.length ;i++) {

  client.query("INSERT INTO locations (type, parent, isusercreated, isCountry, isState, isCity, name, population, public) "
    +"VALUES ('Location', 'World', 'false', 'true', 'false', 'false', $1, 0, 'true');",
    [countries[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted country');

      }
  });

//   // client.query("UPDATE locations SET parent = 'World' WHERE name = $1;",
//   //   [countries[i].properties.name],
//   //   function(err, result) {
//   //     if (err) {
//   //       console.log('error updating locations: ', err);
//   //     } else {

//   //     }
//   // });



};



//INSERT CITIES
for (var i=0; i < cities.length ;i++) {

  var parent = cities[i].properties.city.split('/').slice(0, cities[i].properties.city.split('/').length - 1).join('/');
  client.query("INSERT INTO locations (type, parent, isusercreated, isCountry, isState, isCity, name, population, public, latitude, longitude, pointGeometry) "
    +"VALUES ('Location',$2 , false, false, false, true, $1, 0, true, "+cities[i].geometry.coordinates[1]+", "+cities[i].geometry.coordinates[0]+", ST_GeomFromText('POINT("+cities[i].geometry.coordinates[0]+" "+cities[i].geometry.coordinates[1]+")', 4269) );",
    [cities[i].properties.city, parent],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted city');
      }
  });

  


  // client.query("UPDATE locations SET parent = $1 WHERE name = $2;",
  //   [parent, cities[i].properties.city],
  //   function(err, result) {
  //     if (err) {
  //       console.log('error updating locations: ', err);
  //     } else {

  //     }
  // });

  // client.query("UPDATE locations SET (latitude, longitude, pointGeometry) "
  //   +"= ("+cities[i].geometry.coordinates[1]+", "+cities[i].geometry.coordinates[0]+", ST_GeomFromText('POINT("+cities[i].geometry.coordinates[0]+" "+cities[i].geometry.coordinates[1]+")', 4269) ) "
  //   +"WHERE name = $1;",[cities[i].properties.city], function(err, result) {
  //     if (err) console.log('error updating locations: ', err);
  //     console.log('finished updating locations');
  // });

  // client.query("UPDATE locations SET (latitude, longitude, pointGeometry) "
  // +"= (null, null, null);", function(err, result) {
  //   if (err) console.log('error updating locations: ', err);
  //   console.log('finished updating locations');
  // });



};



//INSERT STATES
for (var i=0; i < states.length ;i++) {

  client.query("INSERT INTO locations (type, isusercreated, isCountry, isState, isCity, name, population, public, parent) "
    +"VALUES ('Location', false, false, true, false, $1, 0, true, 'World/United States');",
    [states[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {
        console.log('inserted state');
      }
  });


// client.query("UPDATE locations SET parent = 'World/United States' WHERE name = $1;",
//     [states[i].properties.name],
//     function(err, result) {
//       if (err) {
//         console.log('error updating locations: ', err);
//       } else {

//       }
//   });

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



