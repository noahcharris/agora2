
var feeds = require('./RSSFeeds.js').feeds;


//SHOULD TAKE IN AN RSS URL AND LOCATION AND CHANNEL AND NAME OF PUBLICATION (OR NAME OF BOT)

//AND UPDATE THE TOPICS TABLE AS NECESSARY


var args = process.argv.slice(2);

for (var i=0; i < args.length ;i++) {
  console.log(args[i]);
}



var pg = require('pg');

var conString = 'postgres://keybornCat:prairiePiratesPicnic@agora-production-server.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/mahDb';


var client = new pg.Client(conString);
client.connect();


var FeedParser = require('feedparser')
  , request = require('request');




for (var i=0; i < feeds.length ;i++) {

  if (feeds[i].url) {

        feeds[i].name = feeds[i].name || 'RSSBot';


          //CHECK IF USER EXISTS FOR NAME IF NOT CREATE IT


              (function() {

                    var feed = feeds[i];

                    var options = {};

                    var req = request(feed.url)
                      , feedparser = new FeedParser([options]);

                    req.on('error', function (error) {
                      // handle any request errors
                    });
                    req.on('response', function (res) {
                      var stream = this;

                      if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

                      stream.pipe(feedparser);
                    });


                    feedparser.on('error', function(error) {
                      // always handle errors
                    });
                    feedparser.on('readable', function() {
                      // This is where the action is!
                      var stream = this
                        , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
                        , item;

                      while (item = stream.read()) {



                          (function() {

                              var x = item;


                              client.query("SELECT * FROM topics WHERE headline = $1;", [item.title],
                                function(err, result) {
                                  if (result.rows.length) {
                                    //already there
                                  } else {

                                    //TODO FIX THE DATE, SHOULD BE ABLE TO CONVERT THE PROVIDED ONE INSTEAD OF USING now()

                                    client.query("INSERT INTO topics (type, username, headline, contents, link, location, channel, createdAt, rank)"
                                      +" VALUES ('Topic', '"+feed.name+"', $1, $2, $3, '"+feed.location+"', '"+feed.channel+"', now(), 0);",
                                      [x.title, x.description, x.link], function(err, result) {
                                        if (err) {
                                          console.log(err);
                                        } else {
                                          console.log('RSSBot added a topic');
                                        }

                                    });


                                  }
                              });

                            

                          })();


                      }//end item while loop
                    });


              })();//end feed closure

  } else {//end URL check
    //nada
  }





};//end feeds loop









