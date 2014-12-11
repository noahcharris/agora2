var pg = require('pg');

var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://noahharris@localhost:5432/noahharris';

var client = new pg.Client(conString);
client.connect();

var countryData = require('../client/resources/newCountries.js');
var cityData = require('../client/resources/cities.js');
var statesData = require('../client/resources/us-states.js');

countries = countryData.countries.features;
cities = cityData.cities.features;
states = statesData.states.features;


//INSERT WORLD
client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
  +"VALUES ('Location', false, $1, 0, true);",
  ['World'],
  function(err, result) {
    if (err) {
      console.log('error inserting into locations: ', err);
    } else {

    }
});


//INSERT COUNTRIES
for (var i=0; i < countries.length ;i++) {

  client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
    +"VALUES ('Location', false, $1, 0, true);",
    [countries[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {

      }
  });

};


//INSERT CITIES
for (var i=0; i < cities.length ;i++) {

  client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
    +"VALUES ('Location', false, $1, 0, true);",
    [cities[i].properties.city],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {

      }
  });

};


//INSERT STATES
for (var i=0; i < states.length ;i++) {

  client.query("INSERT INTO locations (type, isusercreated, name, population, public) "
    +"VALUES ('Location', false, $1, 0, true);",
    [states[i].properties.name],
    function(err, result) {
      if (err) {
        console.log('error inserting into locations: ', err);
      } else {

      }
  });

};





//CHANNELS








