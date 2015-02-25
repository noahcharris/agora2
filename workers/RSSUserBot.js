
var feeds = require('./RSSFeeds.js').feeds;


var pg = require('pg');

var conString = 'postgres://keybornCat:prairiePiratesPicnic@agora-production-server.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/mahDb';


var client = new pg.Client(conString);
client.connect();


for (var i=0; i < feeds.length ;i++) {

  if (feeds[i].name) {
      (function() {
          var feed = feeds[i];
          client.query("SELECT * FROM users WHERE username='"+feed.name+"';",
            function(err ,result) {
            if (!result.rows.length) {
              
              client.query("INSERT INTO users (type, username, location, origin, about, image) "
                +"VALUES ('User', '"+feed.name+"', '"+feed.location+"', '"+feed.location+"','o_O', 'http://www.mathworks.com/cmsimages/77904_wm_nao-robot-matlab-gallery-image1.png');",
                function(err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('created new user');
                  }
              });
            }

          });
      })();

  }






}










