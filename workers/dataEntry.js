var countryData = require('../client/resources/countries.js');
var cityData = require('../client/resources/cities.js');
var statesData = require('../client/resources/us-states.js');

countries = countryData.countries;
cities = cityData.cities.features;
states = statesData.states.features;

for (var i=0; i < countries.length ;i++) {

  console.log('insert country into database')

};


for (var i=0; i < cities.length ;i++) {

  console.log('insert city into database')

};


for (var i=0; i < states.length ;i++) {

  console.log('insert state into database')

};