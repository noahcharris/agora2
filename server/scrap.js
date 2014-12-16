client.query("SELECT * FROM topics WHERE (location = $1 AND channel = $2) ORDER BY rank DESC;",
    [location, channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {

      }
});



response.setHeader('Access-Control-Allow-Origin', 'http://liveworld.io');




response.cookie('cokkieName',47538924, { maxAge: 900000, httpOnly: true });
console.log(response.cookies);


var queryArgs = url.parse(request.url, true).query;



//MEMCACHED

memcached.set(keyString, [result.rows[0].location], 2592000, function(err) {
    console.log('error setting topicLocations key: ', err);
});

memcached.get('foo', function (err, data) {
  console.log(data);
});



ST_GeomFromText(text, srid) returns geometry

ST_AsGeoJSON(geometry) returns text



AWS ACCESS KEYS

AWSAccessKeyId=AKIAIFTRAZLMMQJZ6OWQ
AWSSecretKey=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



ANON LINK
'http://www.utne.com/~/media/Images/UTR/Editorial/Articles/Magazine%20Articles/2012/11-01/Anonymous%20Hacktivist%20Collective/Anonymous-Seal.jpg'