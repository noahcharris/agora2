var Memcached = require('memcached');

// Have to include port number in the connection string or it won't work
var memcached = new Memcached('127.0.0.1:11211');


// SETTING AND GETTING DATA

memcached.set('foo', 'bar', 100, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log('successfully inserted data');

    memcached.get('foo', function (err, data) {
      console.log(data);
    });
  }
});
