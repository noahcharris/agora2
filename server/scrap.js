client.query("SELECT * FROM topics WHERE (location = $1 AND channel = $2) ORDER BY rank DESC;",
    [location, channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {

      }
});





