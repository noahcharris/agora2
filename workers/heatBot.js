var pg = require('pg');
var Q = require('q');

//var conString = 'postgres://noahharris@localhost:5432/noahharris';
var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';
var client = new pg.Client(conString);
client.connect();

var defer = Q.defer();

client.query("UPDATE topics SET heat = heat - 1 WHERE heat > 0;",
  function(err, result) {
    if (err) {
      console.log('error subtracting heat from topic: ', err);
      defer.reject(new Error('error'));
    } else {
      console.log('successfully subtracted heat');
      defer.resolve();
    }
});

return defer.promise
.then(function() {
  process.exit();
}, function() {
  process.exit();
});

