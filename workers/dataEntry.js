var pg = require('pg');

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


// //INSERT WORLD
// client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
//   +"VALUES ('Location', false, $1, 0, true);",
//   ['World'],
//   function(err, result) {
//     if (err) {
//       console.log('error inserting into locations: ', err);
//     } else {

//     }
// });
// console.log('finished inserting world');



//INSERT COUNTRIES
for (var i=0; i < countries.length ;i++) {

  // client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
  //   +"VALUES ('Location', false, $1, 0, true);",
  //   [countries[i].properties.name],
  //   function(err, result) {
  //     if (err) {
  //       console.log('error inserting into locations: ', err);
  //     } else {

  //     }
  // });

  // client.query("UPDATE locations SET parent = 'World' WHERE name = $1;",
  //   [countries[i].properties.name],
  //   function(err, result) {
  //     if (err) {
  //       console.log('error updating locations: ', err);
  //     } else {

  //     }
  // });



};
console.log('finished inserting countries');



//INSERT CITIES
for (var i=0; i < cities.length ;i++) {

  // client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
  //   +"VALUES ('Location', false, $1, 0, true);",
  //   [cities[i].properties.city],
  //   function(err, result) {
  //     if (err) {
  //       console.log('error inserting into locations: ', err);
  //     } else {

  //     }
  // });

  
  var parent = cities[i].properties.city.split('/').slice(0, cities[i].properties.city.split('/').length - 1).join('/');


  client.query("UPDATE locations SET parent = $1 WHERE name = $2;",
    [parent, cities[i].properties.city],
    function(err, result) {
      if (err) {
        console.log('error updating locations: ', err);
      } else {

      }
  });



};
console.log('finished inserting cities');



//INSERT STATES
for (var i=0; i < states.length ;i++) {

  // client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
  //   +"VALUES ('Location', false, $1, 0, true);",
  //   [states[i].properties.name],
  //   function(err, result) {
  //     if (err) {
  //       console.log('error inserting into locations: ', err);
  //     } else {

  //     }
  // });


// client.query("UPDATE locations SET parent = 'World/United States' WHERE name = $1;",
//     [states[i].properties.name],
//     function(err, result) {
//       if (err) {
//         console.log('error updating locations: ', err);
//       } else {

//       }
//   });

};
console.log('finished inserting states');








// //CHANNELS
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




