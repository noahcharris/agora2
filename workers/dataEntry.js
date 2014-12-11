var countryData = require('../client/resources/newCountries.js');
var cityData = require('../client/resources/cities.js');
var statesData = require('../client/resources/us-states.js');

countries = countryData.countries.features;
cities = cityData.cities.features;
states = statesData.states.features;


//INSERT WORLD




//INSERT COUNTRIES
for (var i=0; i < countries.length ;i++) {

  console.log('insert ', countries[i].properties.name, ' into database');

};


//INSERT CITIES
for (var i=0; i < cities.length ;i++) {

  console.log('insert ', cities[i].properties.city, ' into database');

};


//INSERT STATES
for (var i=0; i < states.length ;i++) {

  console.log('insert ', states[i].properties.name, ' into database');

};