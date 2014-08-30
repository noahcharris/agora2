
// ### Converts country borders from this random file I found to geojson ###
var fs = require('fs');
old = require('./countries.js');

console.log('parsing old data..');
var oldData = old.countries; //JSON.parse(fs.readFileSync('./countries.js'));

var newData = { 'type': 'FeatureCollection' };

newFeatureList = [];


console.log('building new data..');
for (var i=0;i<oldData.length;i++) {
  var temp = {};
  temp.type = 'Feature';
  temp.properties = {};
  temp.properties.name = oldData[i].name;
  temp.properties.code = oldData[i].code;
  temp.geometry = {};

  //figure out if it's a polygon or a multipolygon
  var borderString = JSON.stringify(oldData[i].borders);
  borderString = borderString.slice(2,borderString.length-2);
  if (borderString.indexOf('[[') != -1 || borderString.indexOf(']]') != -1) {

    //how do I add in the extra brackets?

    var regex1 = new RegExp('\\[\\[', 'g');
    var regex2 = new RegExp(']]', 'g');
    borderString = borderString.replace(regex1, '[[[');
    borderString = borderString.replace(regex2, ']]]');
    borderString = '[[['+borderString+']]]';

    console.log(borderString);
    
    temp.geometry.type = 'MultiPolygon';
    temp.geometry.coordinates = JSON.parse(borderString);

    newFeatureList.push(temp);


  } else {
    temp.geometry.type = 'Polygon';
    temp.geometry.coordinates = oldData[i].borders;
    newFeatureList.push(temp);
  }

  // temp.geometry.coordinates = oldData[i].borders;
  // newFeatureList.push(temp);
};

newData.features = newFeatureList;

console.log('writing new data..');
fs.writeFileSync('./newCountries.js', JSON.stringify(newData));


console.log('done!');
