
var postgres = require('./postgres.js');

var pg = require('pg');
var url = require('url');
var Memcached = require('memcached');
var amqp = require('amqplib');
var when = require('when');
var bcrypt = require('bcrypt');
var s3 = require('s3');

var multiparty = require('multiparty');

var cookie = require('cookie');

var _ = require('underscore');

//var treeBuilder = require('../workers/treebuilder.js');




//password hashing
bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash('secret', salt, function(err, hash) {
      // Store hash in your password DB.
  });
});





//Memcached and RabbitMQ connections
var connection = amqp.connect('amqp://localhost')
var q = 'tasks';

// Have to include port number in the connection string or it won't work
var memcached = new Memcached('127.0.0.1:11211');



//####################
//####  Postgres  ####
//####################
var conString = 'postgres://noahharris@localhost:5432/noahharris';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';
var client = new pg.Client(conString);
client.connect();




// ## SETUP CONSISTENT MESSAGE TIMERS ##

//am i creating zombies when I make all these brief connections with memcached?? Need to research.

// function memcachedTimers() {

//   connection.then(function(conn) {
//     var ok = conn.createChannel();
//     ok = ok.then(function(ch) {
//       ch.assertQueue(q);
//       // Here we are sending the tree:<path>:<filter> command
//       var msg = 'Tree:';
//       ch.sendToQueue(q, new Buffer('Tree:'));
//       ch.sendToQueue(q, new Buffer('Tree:France'));
//       //console.log(" [x] Sent '%s'", msg);
//     });
//     return ok;
//   }).then(null, console.warn);

// }

// memcachedTimers();
// setInterval(memcachedTimers, 100000);

//#####################################


var s3Client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: 'AKIAIFTRAZLMMQJZ6OWQ',
    secretAccessKey: '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',
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

















/********************************************/
/***   TOPICS WITH FILTERS METHODS     ******/
/********************************************/







module.exports.getTopTopicsDay = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;


  var location = queryArgs.location;
  var channel = queryArgs.channel;
  var page = queryArgs.page;


  console.log('location: ', location);
  console.log('channel: ', channel);
  console.log('page: ', page);

  //testing memcached !!!!!!!!!!!!!!!!!
  // if (queryArgs.location === '')
  //   location = 'World';

  var keyString = location + '~' + channel + '~TopTopicsDay';


  // console.log('attempting to retrieve topics from: '+keyString);
  // memcached.get(keyString, function (err, data) {
  //   if (data) {
  //     console.log('sending data from memcached to client');
  //     console.log(data[0]);
  //     response.json(data);
  //   } else {    
  //     console.log('memcached returned false for ', keyString);
  //     response.json(false);
  //   }

  // });


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY rank DESC;",
    //!!!! the concatenated % allows postgres to match, so the cascading effect occurs
    [location + '%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });


};


module.exports.getTopTopicsWeek = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY rank DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};

module.exports.getTopTopicsMonth = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY rank DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });
};

module.exports.getTopTopicsYear = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY rank DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};

module.exports.getTopTopicsTime = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY rank DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};



//## NEW TOPICS ####

module.exports.getNewTopics = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY createdAt DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};




module.exports.getHotTopics = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;

  console.log('location: ', location);
  console.log('channel: ', channel);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel = $2) ORDER BY heat DESC;",
    [location+'%', channel],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};

module.exports.getTopicTree = function(request, response) {




  var queryArgs = url.parse(request.url, true).query;


    //woooo treebuilder 2.0

    var count = 0;
    var topic = null;
    var comments = [];
    var responses = [];
    var replies = [];

    client.query("SELECT * FROM topics WHERE topics.id=$1",[queryArgs.topicId], function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        count++;
        topic = result.rows[0];
        if (count === 4) {

        }
      }

    });

    client.query("SELECT * FROM comments WHERE comments.topic=$1 ORDER BY rank ASC",[queryArgs.topicId], function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        count++;
        comments = result.rows;
        if (count === 4) {
          response.json(buildSequence(topic, comments, responses, replies));
        }
      }
    });

    client.query("SELECT * FROM responses WHERE responses.topic=$1 ORDER BY rank ASC",[queryArgs.topicId], function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        count++;
        responses = result.rows;
        if (count === 4) {
          response.json(buildSequence(topic, comments, responses, replies));
        }
      }
    });

    client.query("SELECT * FROM replies WHERE replies.topic=$1 ORDER BY rank ASC",[queryArgs.topicId], function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        count++;
        replies = result.rows;
        if (count === 4) {
          response.json(buildSequence(topic, comments, responses, replies));
        }
      } 
    });


    function buildSequence(topic, comments, responses, replies) {


      var responses = responses.slice(0);
      var resultTree = topic;
      resultTree.comments = [];
      for (var i=0; i < comments.length ;i++) {
        comments[i].responses = [];
        resultTree.comments.push(comments[i]);
      }
      for (var i=0; i < responses.length ;i++) {
        responses[i].replies = [];
      }



      for (var i=0; i < replies.length ;i++) {


        for (var j=0; j < responses.length ;j++) {
          if (responses[j].id === replies[i].response) {
            responses[j].replies.push(replies[i]);
            break;
          }
        }
      }


      for (var i=0; i < responses.length ;i++) {

        for (var j=0; j < resultTree.comments.length ;j++) {
          if (responses[i].comment === comments[j].id) {
            resultTree.comments[j].responses.push(responses[i]);
            break;
          }

        }

      }

      return resultTree;

    };


};

module.exports.getTopicLocations = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT locations FROM topics WHERE id=$1;",
      [queryArgs.topicId],
      function(err, result) {
        if (err) {
          console.log('error selecting from topics: ', err);
          response.end('error');
        } else {
          response.json(result.rows[0].locations);
        }
  });




  // console.log('heyyyy', queryArgs.topicId);
  // var keyString = 'topicLocations:' + queryArgs.topicId;
  // memcached.get(keyString, function(err, data) {
  //   if (err) {
  //     console.log('error getting topic locations from memcached: ', err);
  //   } else {
  //     console.log('PULLED: ', data, ' OUT OF MEMCACHED');
  //     response.json(data);
  //   }
  // })

};


//##########################################
//############  SEARCHES    ################
//##########################################


module.exports.topicSearch = function(request, response) {

  response.end('TODO');
    //TODO
};

module.exports.userSearch = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  console.log('input: ', queryArgs.input);

  client.query("SELECT * FROM users WHERE username LIKE $1;",
      [queryArgs.input + '%'],
      function(err, result) {
        if (err) {
          console.log('error searching users with LIKE: ', err);
          response.end('error');
        } else {
          response.json(result.rows);
        }
  });


};


//maybe send back subtrees here
module.exports.locationSearch = function(request, response) {

    var returnCollection = [];
    response.json(returnCollection);

};

//maybe send back subtrees here
module.exports.channelSearch = function(request, response) {

  var returnCollection = [];
  response.json(returnCollection);

};

//maybe just return subtrees with the topics and locations themselves?????
module.exports.getLocationSubtree = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;
  console.log('searching for loaction subtrees for: ', queryArgs.location);

  client.query("SELECT * FROM locations WHERE parent = $1;",
      [queryArgs.location],
      function(err, result) {
        if (err) {
          console.log('error selecting from locations: ', err);
          response.end('error');
        } else {
          response.json(result.rows);
        }
  });

};

//maybe just return subtrees with the topics and locations themselves?????
module.exports.getChannelSubtree = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT * FROM channels WHERE parent = $1;",
      [queryArgs.channel],
      function(err, result) {
        if (err) {
          console.log('error selecting from channels: ', err);
          response.end('error');
        } else {
          response.json(result.rows);
        }
  });


  //response.json(['Music', 'Politics', 'Guns']);
};


module.exports.getContacts = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  client.query("SELECT * FROM users JOIN contactsjoin " 
    +"ON (contactsjoin.username1 = $1 AND contactsjoin.username2 = users.username) "
    +"OR (contactsjoin.username1 = users.username AND contactsjoin.username2 = $1);",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
    });
  };

module.exports.getMessageChains = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  client.query("SELECT * FROM messageChains WHERE "
    +"(username1 = $1 OR username2 = $1) ORDER BY lastMessage DESC;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from messageChains: ', err);
      } else {
        response.json(result.rows);
      }
  });


};

module.exports.getMessageChain = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  console.log('get chain');
  console.log(queryArgs.contact, queryArgs.username);

  //KIND BUMMED THAT I'M NOT USING THIS FORMAT ANYMORE.. MODEL2... smh
  // response.json({
  //     id: 0,
  //     type: 'Message',
  //     sender: 'noahcharris',
  //     recipient: 'spw',
  //     entries: [{
  //       sender: 'spw',
  //       contents: 'hey dude'
  //     },{
  //       sender: 'noah',
  //       contents: 'yo'
  //     },{
  //       sender: 'spw',
  //       contents: 'what it is'
  //     }]
  //   });


  client.query("SELECT * FROM messages WHERE (sender=$1 AND recipient=$2) "
    +"OR (sender=$2 AND recipient=$1) ORDER BY sentAt DESC;",
    [queryArgs.username, queryArgs.contact],
    function(err, result) {
      if (err) {
        console.log('error selecting from messages: ', err);
        response.end('error');
      } else {
        response.json(result.rows);

        //remove any potential send message notifications that could have existed
        //this could be more efficient somehow...
        client.query("DELETE FROM newMessageJoin WHERE sender = $1 AND recipient = $2;",
        [queryArgs.contact, queryArgs.username], function(err, result) {
          if (err) {
            console.log('error selecting from newMessageJoin: ', err);
          }
        });

      }
  });




};


module.exports.getPoints = function(request, response) {
  // var queryArgs = url.parse(request.url, true).query;
  // postgres.retrievePointsWithinRadius(queryArgs.latitude, queryArgs.longitude, function(data) {
  //   response.json(data);
  // });
  response.json([]);
};


module.exports.getUser = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  //SECURITY HOLE, THIS MEANS SOMEONE CAN FIND OUT IF TWO PEOPLE ARE CONTACTS OR NOT

  // if (!queryArgs.asker) {

  console.log('NOOO ASKERRR');
  client.query("SELECT * FROM users WHERE username=$1;", [queryArgs.username], function(err, result) {
      if (err) {
        console.log('error selecting from users: ', err);
      } else {

        response.json(result.rows);
      }
  });

  // } else {


    //wont have to do this once the cache manager is working..
    // client.query("SELECT * FROM users JOIN contactsjoin ON "
    // +"(contactsjoin.username1 = $2 "
    // +"AND contactsjoin.username2 = $1 "
    // +"AND users.username = $1) "
    // +"OR "
    // +"(contactsjoin.username1 = $1 "
    // +"AND contactsjoin.username2 = $2 "
    // +"AND users.username = $1);", [queryArgs.username, queryArgs.asker],
    // function(err, result) {

    //   if (err) {
    //     console.log('error selecting from users join contactsjoin: ', err);
    //   } else {

    //     if (result.rows[0].username1) {
    //       result.rows[0]

    //       }
    //     }


    //     response.json(result.rows);
    //   }

    // });


  // }





};


module.exports.getLocation = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrievePlace(queryArgs.location, function(data) {
    response.json(data);
  });
};

module.exports.getChannel = function(request, response) {
  response.end('wooo');
}



module.exports.getNotifications = function(request, response) {


  var queryArgs = url.parse(request.url, true).query;
  var notifications = {}; //master notifications object to send back at the end

  //check for any pending contact requests
  client.query("SELECT * FROM contactRequestJoin WHERE (recipient = $1) ORDER BY sentAt DESC;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from contactRequestJoin: ', err);
        response.end('error');
      } else {

        notifications.contactRequests = result.rows;



        //check for any new message alerts
        client.query("SELECT * FROM newMessageJoin WHERE (recipient = $1) ORDER BY sentAt DESC;",
          [queryArgs.username],
          function(err, result) {
            if (err) {
              console.log('error selecting from newMessageJoin: ', err);
              response.end('error');
            } else {

              notifications.newMessages = result.rows;





              client.query("SELECT * FROM topicActivityJoin WHERE (username = $1) ORDER BY sentAt DESC;",
                [queryArgs.username],
                function(err, result) {
                  if (err) {
                    console.log('error selecting from newMessageJoin: ', err);
                    response.end('error');
                  } else {

                    notifications.topicActivity = result.rows;

                    response.json(notifications);


                  }
              });




              //THE STEPPES


            }
        });



        //OF WOE

      }
  });


};







module.exports.login = function(request, response) {


  //NEED TO MAKE SURE THAT NOT HTTPS REQUESTS DO NOT WORK HERE
  //NEED CSRF PROTECTION

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');

  //request.session.hello = 'yo';
  //console.log('SESSION: ', request.session.hello);

  postgres.retrieveUser(request.body.username, function(data) {
    if (data[0]) {
      bcrypt.compare(request.body.password, data[0].passhash, function(err, res) {
        if (res) {

          //LOGIN SUCCESSFUL

          console.log('Login successful for user: ', request.body.username);
          //response.setHeader('Set-Cookie', 'wooooooooooo=wooooooo');

          console.log('before set: ', request.mySession);


          request.mySession.login = true;


          console.log('after set: ', request.mySession);

          //request.session.login = true;
          //request.session.username = request.body.username;

          //console.log('seen you: ', request.mySession.seenyou);

          //do we give the csrf token here also?

          response.end('True');
        } else {

          //LOGIN FAILED
          console.log('login failed');
          response.end('False');
        }
      });
    } else {
      response.end('False');
    }
  });

};


module.exports.logout = function(request, response) {

  request.session.login = false;

};






/***************************/
/***************************/
/***  CREATION ROUTES    ***/
/***************************/
/***************************/


module.exports.addContact = function(request, response) {

  console.log(request.body.username);
  console.log(request.body.contact);

  //ADD CONTACT REQUEST KEY FORMAT:   <username>/addContactRequest/<contact>
  client.query("SELECT * FROM contactRequestJoin WHERE (sender=$1 AND recipient = $2)",
      [request.body.contact, request.body.username],
      function(err, result) {
        if (err) {
          console.log('error selecting from contactRequestJoin: ', err);
          response.end('error');
        } else {

          //ONCE WE CHECK

          //IF THERE IS AN ENTRY THAN INSERT INTO CONTACTSJOIN
          if (result.rows.length) {
            //if they have, add to the contact join and delete data from memcached

                client.query("INSERT INTO contactsjoin (username1, username2) "
                  +"VALUES ($1, $2);",
                [request.body.username, request.body.contact],
                function(err, result) {
                  if (err) {
                    console.log('error inserting into contactsjoin: ', err);
                  } else {
                        console.log('successfully inserted into contactsjoin');
                        //HAVE TO DELETE BOTH, BECAUSE IT'S POSSIBLE FOR USERS TO WRITE THEIR 
                        //REQUESTS AT THE SAME TIME AS EACH OTHER , HIGHLY UNLIKELY THO
                        client.query("DELETE FROM contactRequestJoin WHERE (sender = $1 AND recipient = $2)"
                          +" OR (sender = $2 AND recipient = $1);",
                            [request.body.username, request.body.contact],
                            function(err, result) {
                              if (err) {
                                console.log('error selecting from topics: ', err);
                                response.end('error');
                              } else {
                                //reword this fo sho
                                response.end('you and '+ request.body.contact +' are now contacts');
                              }
                        });
                  }

                });

          } else {
              //if there is no pending request, put a request into memcached
              client.query("INSERT INTO contactRequestJoin (sender, recipient) "
                +"VALUES ($1, $2);",
              [request.body.username, request.body.contact],
              function(err, result) {
                if (err) {
                  console.log('error inserting into contactsRequestJoin: ', err);
                } else {
                  response.end('sent contact request');
                }
              });
          }
      }
  });


    


      // memcached.append(request.body.contact + '/notifications', request.body.username, true, 2592000, function(err) {
      //   if (err) {
      //     console.log('error setting notification to memcached: ', err);
      //   } else {
      //   }
      // });


      //maybe alert the user some other way??
      //their cache manager will deal with it.



};



module.exports.createMessageChain = function(request, response) {

  client.query("INSERT INTO messageChains (type, username1, username2) "
    +"VALUES ('MessageChain', $1, $2);",
    [request.body.username, request.body.contact],
    function(err, result) {
      if (err) {
        console.log('error inserting into messageChains: ', err);
        response.end('error');
      } else {
        response.end('successfully created messageChain');
      }
    });


};


module.exports.sendMessage = function(request, response) {


  client.query("INSERT INTO messages (type, sender, recipient, contents, sentAt) "
    +"VALUES ('Message', $1, $2, $3, now());",
      [request.body.sender, request.body.recipient, request.body.contents],
      function(err, result) {
        if (err) {
          console.log('error inserting into messages: ', err);
          response.end('error');
        } else {
          response.end('successfully created message');


          client.query("SELECT * FROM newMessageJoin WHERE sender = $1 AND recipient = $2;",
          [request.body.sender, request.body.recipient], function(err, result) {
            if (err) {
              console.log('error selecting from newMessageJoin: ', err);
            } else {
              if (result.rows.length === 0) {

                  client.query("INSERT INTO newMessageJoin (sender, recipient) "
                  +"VALUES ($1, $2);", [request.body.sender, request.body.recipient],
                  function(err, result) {
                    if (err) {
                      console.log('error inserting into newMessageJoin: ', err);
                    } else {
                    }
                  });

              }


            }
          });



        }
  });


};





module.exports.registerUser = function(request, response) {

  //NEED TO MAKE SURE THAT THE USER DOES NOT ALREADY EXITS
  //Actually, this is a larger question of how to alert 
  //to the user whether or not his field input is valid

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');

  console.log(request);

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(request.body.password, salt, function(err, hash) {

      postgres.createUser(request.body.username, hash, salt, 
        request.body.origin, request.body.about, function(success) {
          if (success) {
            //send back login token here????
            response.end('successfully created user');
          } else {
            response.end('error creating user');
          }
      });
    });
  });

};




module.exports.updateUserProfile = function(request, response) {


  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {

    //if an image is sent
    if (files.file) {

      var keyString = fields.username[0];

      var params = {
        localFile: files.file[0].path,

        s3Params: {
          Bucket: "agora-image-storage",
          Key: keyString,
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };

      var uploader = s3Client.uploadFile(params);
      uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
      });

      uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
                  uploader.progressAmount, uploader.progressTotal);
      });

      uploader.on('end', function() {
        console.log("done uploading");

        var imageLink = 'https://s3-us-west-2.amazonaws.com/agora-image-storage/' + keyString;


        console.log('whaaaaaaa: ', fields.about[0]);
        client.query("UPDATE users SET about = $1, image = $2 WHERE username = $3;",
          [fields.about[0], imageLink, fields.username[0]],
          function(err, result) {
            if (err) {
              console.log('error updating users table: ', err);
            } else {
              response.end('successfully updated profile');
            }
        });
        
      });

    } else {

      //NO IMAGE

      client.query("UPDATE users SET about = $1 WHERE username = $2;",
        [fields.about[0], fields.username[0]],
        function(err, result) {
          if (err) {
            console.log('error updating users table: ', err);
          } else {
            response.end('successfully updated profile (no image)');
          }
      });






    }


  });






};

module.exports.updateLocationProfile = function(request, response) {
  response.end('TODO');
};

module.exports.updateChannelProfile = function(request, response) {
  response.end('TODO');
};









module.exports.createTopic = function(request, response) {

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');


  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {

    //if an image is sent
    if (files.file) {

            //insert and fetch id here, then upload the image to amazon

            client.query("INSERT INTO topics (type, username, headline, link, contents, location, locations, channel, createdAt, rank, heat)"
            +"VALUES ('Topic', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
            [fields.username[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], "{\""+fields.location[0]+"\"}", fields.channel[0]],
            function(err, result) {

                if (err) {
                  console.log('error inserting into topics: ', err);
                } else {

                        client.query("SELECT * FROM topics WHERE username=$1 ORDER BY createdAt DESC LIMIT 1;",
                        [fields.username[0]],
                        function(err, result) {
                          if (err) {
                                console.log('error selecting from topics: ', err);
                                response.end('error');
                          } else {
                                    //this is where we use that id we just fetched
                                    var keyString = 'topicImage' + result.rows[0].id;

                                    var params = {
                                      localFile: files.file[0].path,

                                      s3Params: {
                                        Bucket: "agora-image-storage",
                                        Key: keyString,
                                        // other options supported by putObject, except Body and ContentLength.
                                        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                                      },
                                    };

                                    var uploader = s3Client.uploadFile(params);
                                    uploader.on('error', function(err) {
                                      console.error("unable to upload:", err.stack);
                                    });

                                    uploader.on('progress', function() {
                                      console.log("progress", uploader.progressMd5Amount,
                                                uploader.progressAmount, uploader.progressTotal);
                                    });

                                    uploader.on('end', function() {
                                      console.log("done uploading");


                                          var imageLink = 'https://s3-us-west-2.amazonaws.com/agora-image-storage/' + keyString;


                                          client.query("UPDATE topics SET image = $1 WHERE id = $2",
                                            [imageLink, result.rows[0].id], function(err, result) {
                                              response.end('successfully submitted topic');
                                          });
                                    });
                          }
                        });//end topic id select
                }
              });//end topic insert


            
    } else {

      //##############
      //NO IMAGE
      //##############

      client.query("INSERT INTO topics (type, username, headline, link, contents, location, locations, channel, createdAt, rank, heat)"
      +"VALUES ('Topic', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
      [fields.username[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], "{\""+fields.location[0]+"\"}", fields.channel[0]], 
      function(err, result) {
        if (err) {
          console.log('error inserting into topics: ', err);
          response.end('error');
        } else {


          response.end('successfully created topic (no image)');
        }
      });


    }
  });//end multiparty parse


};







module.exports.createComment = function(request, response) {




  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');


  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {

    //if an image is sent
    if (files.file) {

            //insert and fetch id here, then upload the image to amazon

            client.query("INSERT INTO comments (type, username, topic, headline, link, contents, location, channel, createdAt, rank, heat)"
            +"VALUES ('Comment', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
            [fields.username[0], fields.topicId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]],
            function(err, result) {

                if (err) {
                  console.log('error inserting into comments: ', err);
                } else {

                        client.query("SELECT * FROM comments WHERE username=$1 ORDER BY createdAt DESC LIMIT 1;",
                        [fields.username[0]],
                        function(err, result) {
                          if (err) {
                                console.log('error selecting from comments: ', err);
                                response.end('error');
                          } else {
                                    //this is where we use that id we just fetched
                                    var keyString = 'commentImage' + result.rows[0].id;

                                    var params = {
                                      localFile: files.file[0].path,

                                      s3Params: {
                                        Bucket: "agora-image-storage",
                                        Key: keyString,
                                        // other options supported by putObject, except Body and ContentLength.
                                        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                                      },
                                    };

                                    var uploader = s3Client.uploadFile(params);
                                    uploader.on('error', function(err) {
                                      console.error("unable to upload:", err.stack);
                                    });

                                    uploader.on('progress', function() {
                                      console.log("progress", uploader.progressMd5Amount,
                                                uploader.progressAmount, uploader.progressTotal);
                                    });

                                    uploader.on('end', function() {
                                      console.log("done uploading");


                                          var imageLink = 'https://s3-us-west-2.amazonaws.com/agora-image-storage/' + keyString;


                                          client.query("UPDATE comments SET image = $1 WHERE id = $2",
                                            [imageLink, result.rows[0].id], function(err, result) {
                                              response.end('successfully submitted comment');
                                          });
                                    });
                          }
                        });//end topic id select
                }
              });//end topic insert


            
    } else {

      //##############
      //NO IMAGE
      //##############

      client.query("INSERT INTO comments (type, username, topic, headline, link, contents, location, channel, createdAt, rank, heat)"
      +"VALUES ('Comment', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
      [fields.username[0], fields.topicId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]], 
      function(err, result) {
        if (err) {
          console.log('error inserting into comments: ', err);
          response.end('error');
        } else {


          response.end('successfully created comment (no image)');
        }
      });


    }
  });//end multiparty parse





};





module.exports.createResponse = function(request, response) {




  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');


  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {

    //if an image is sent
    if (files.file) {

            //insert and fetch id here, then upload the image to amazon
            client.query("INSERT INTO responses (type, username, topic, comment, headline, link, contents, location, channel, createdAt, rank, heat)"
            +"VALUES ('Response', $1, $2, $3, $4, $5, $6, $7, $8, now(), 0, 30);",
            [fields.username[0], fields.topicId[0], fields.commentId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]],
            function(err, result) {

                if (err) {
                  console.log('error inserting into responses: ', err);
                } else {

                        client.query("SELECT * FROM responses WHERE username=$1 ORDER BY createdAt DESC LIMIT 1;",
                        [fields.username[0]],
                        function(err, result) {
                          if (err) {
                                console.log('error selecting from responses: ', err);
                                response.end('error');
                          } else {
                                    //this is where we use that id we just fetched
                                    var keyString = 'responseImage' + result.rows[0].id;

                                    var params = {
                                      localFile: files.file[0].path,

                                      s3Params: {
                                        Bucket: "agora-image-storage",
                                        Key: keyString,
                                        // other options supported by putObject, except Body and ContentLength.
                                        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                                      },
                                    };

                                    var uploader = s3Client.uploadFile(params);
                                    uploader.on('error', function(err) {
                                      console.error("unable to upload:", err.stack);
                                    });

                                    uploader.on('progress', function() {
                                      console.log("progress", uploader.progressMd5Amount,
                                                uploader.progressAmount, uploader.progressTotal);
                                    });

                                    uploader.on('end', function() {
                                      console.log("done uploading");


                                          var imageLink = 'https://s3-us-west-2.amazonaws.com/agora-image-storage/' + keyString;


                                          client.query("UPDATE responses SET image = $1 WHERE id = $2",
                                            [imageLink, result.rows[0].id], function(err, result) {
                                              response.end('successfully submitted response');
                                          });
                                    });
                          }
                        });//end topic id select
                }
              });//end topic insert


            
    } else {

      //##############
      //NO IMAGE
      //##############

      client.query("INSERT INTO responses (type, username, topic, comment, headline, link, contents, location, channel, createdAt, rank, heat)"
      +"VALUES ('Response', $1, $2, $3, $4, $5, $6, $7, $8, now(), 0, 30);",
      [fields.username[0], fields.topicId[0], fields.commentId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]], 
      function(err, result) {
        if (err) {
          console.log('error inserting into responses: ', err);
          response.end('error');
        } else {


          response.end('successfully created response (no image)');
        }
      });


    }
  });//end multiparty parse






};





module.exports.createReply = function(request, response) {





  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');


  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {

    //if an image is sent
    if (files.file) {

            //insert and fetch id here, then upload the image to amazon
            client.query("INSERT INTO replies (type, username, topic, comment, response, headline, link, contents, location, channel, createdAt, rank, heat)"
            +"VALUES ('Reply', $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), 0, 30);",
            [fields.username[0], fields.topicId[0], fields.commentId[0], fields.responseId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]],
            function(err, result) {

                if (err) {
                  console.log('error inserting into replies: ', err);
                } else {

                        client.query("SELECT * FROM replies WHERE username=$1 ORDER BY createdAt DESC LIMIT 1;",
                        [fields.username[0]],
                        function(err, result) {
                          if (err) {
                                console.log('error selecting from replies: ', err);
                                response.end('error');
                          } else {
                                    //this is where we use that id we just fetched
                                    var keyString = 'replyImage' + result.rows[0].id;

                                    var params = {
                                      localFile: files.file[0].path,

                                      s3Params: {
                                        Bucket: "agora-image-storage",
                                        Key: keyString,
                                        // other options supported by putObject, except Body and ContentLength.
                                        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                                      },
                                    };

                                    var uploader = s3Client.uploadFile(params);
                                    uploader.on('error', function(err) {
                                      console.error("unable to upload:", err.stack);
                                    });

                                    uploader.on('progress', function() {
                                      console.log("progress", uploader.progressMd5Amount,
                                                uploader.progressAmount, uploader.progressTotal);
                                    });

                                    uploader.on('end', function() {
                                      console.log("done uploading");


                                          var imageLink = 'https://s3-us-west-2.amazonaws.com/agora-image-storage/' + keyString;


                                          client.query("UPDATE replies SET image = $1 WHERE id = $2",
                                            [imageLink, result.rows[0].id], function(err, result) {
                                              response.end('successfully submitted reply');
                                          });
                                    });
                          }
                        });//end topic id select
                }
              });//end topic insert


            
    } else {

      //##############
      //NO IMAGE
      //##############

      client.query("INSERT INTO replies (type, username, topic, comment, response, headline, link, contents, location, channel, createdAt, rank, heat)"
      +"VALUES ('Reply', $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), 0, 30);",
      [fields.username[0], fields.topicId[0], fields.commentId[0], fields.responseId[0], fields.headline[0], fields.link[0], fields.contents[0], fields.location[0], fields.channel[0]], 
      function(err, result) {
        if (err) {
          console.log('error inserting into replies: ', err);
          response.end('error');
        } else {


          response.end('successfully created reply (no image)');
        }
      });


    }
  });//end multiparty parse









};








module.exports.upvoteTopic = function(request, response) {


  client.query("SELECT * FROM topicVoteJoin where (username=$1 AND topic=$2);",
    [request.body.username, request.body.topicId],
    function(err, result) {
      if (err) {
        console.log('error selecting from topicVoteJoin: ', err);
        //should i just send the error back here?
        response.end('error');
      } else {
        if (result.rowCount === 0) {
          client.query("INSERT INTO topicVoteJoin (topic, username) "+
            "VALUES ($1, $2);", [request.body.topicId, request.body.username],
            function(err, result) {
              if (err) {
                console.log('error inserting into topicVoteJoin: ', err);
                response.end('error');
              } else {

                client.query("UPDATE topics SET rank = rank + 1 where id = $1", [request.body.topicId],
                  function(err, result) {
                    if (err) {
                      console.log('error updating topics: ', err);
                      response.end('error');
                    } else {
                      console.log('user: '+request.body.username+' has successfully voted for topic: '+request.body.topicId);
                      response.end('Succesfully voted');
                    }
                });

              }
            });
        } else {
          response.end('Already voted');
        }
      }

  });




};

module.exports.upvoteComment = function(request, response) {
  client.query("SELECT * FROM commentVoteJoin where (username=$1 AND comment=$2);",
    [request.body.username, request.body.commentId],
    function(err, result) {
      if (err) {
        console.log('error selecting from commentVoteJoin: ', err);
        //should i just send the error back here?
        response.end('error');
      } else {
        if (result.rowCount === 0) {
          client.query("INSERT INTO commentVoteJoin (comment, username) "+
            "VALUES ($1, $2);", [request.body.commentId, request.body.username],
            function(err, result) {
              if (err) {
                console.log('error inserting into commentVoteJoin: ', err);
                response.end('error');
              } else {

                client.query("UPDATE comments SET rank = rank + 1 where id = $1", [request.body.commentId],
                  function(err, result) {
                    if (err) {
                      console.log('error updating comments: ', err);
                      response.end('error');
                    } else {
                      console.log('user: '+request.body.username+' has successfully voted for comment: '+request.body.commentId);
                      response.end('Succesfully voted');
                    }
                });

              }
            });
        } else {
          response.end('Already voted');
        }
      }

  });

};

module.exports.upvoteResponse = function(request, response) {
  client.query("SELECT * FROM responseVoteJoin where (username=$1 AND response=$2);",
    [request.body.username, request.body.responseId],
    function(err, result) {
      if (err) {
        console.log('error selecting from responseVoteJoin: ', err);
        //should i just send the error back here?
        response.end('error');
      } else {
        if (result.rowCount === 0) {
          client.query("INSERT INTO responseVoteJoin (response, username) "+
            "VALUES ($1, $2);", [request.body.responseId, request.body.username],
            function(err, result) {
              if (err) {
                console.log('error inserting into responseVoteJoin: ', err);
                response.end('error');
              } else {

                client.query("UPDATE responses SET rank = rank + 1 where id = $1", [request.body.responseId],
                  function(err, result) {
                    if (err) {
                      console.log('error updating responses: ', err);
                      response.end('error');
                    } else {
                      console.log('user: '+request.body.username+' has successfully voted for response: '+request.body.responseId);
                      response.end('Succesfully voted');
                    }
                });

              }
            });
        } else {
          response.end('Already voted');
        }
      }

  });
};

module.exports.upvoteReply = function(request, response) {
  client.query("SELECT * FROM replyVoteJoin where (username=$1 AND reply=$2);",
    [request.body.username, request.body.replyId],
    function(err, result) {
      if (err) {
        console.log('error selecting from replyVoteJoin: ', err);
        //should i just send the error back here?
        response.end('error');
      } else {
        if (result.rowCount === 0) {
          client.query("INSERT INTO replyVoteJoin (reply, username) "+
            "VALUES ($1, $2);", [request.body.replyId, request.body.username],
            function(err, result) {
              if (err) {
                console.log('error inserting into replyVoteJoin: ', err);
                response.end('error');
              } else {

                client.query("UPDATE replies SET rank = rank + 1 where id = $1", [request.body.replyId],
                  function(err, result) {
                    if (err) {
                      console.log('error updating replies: ', err);
                      response.end('error');
                    } else {
                      console.log('user: '+request.body.username+' has successfully voted for reply: '+request.body.replyId);
                      response.end('Succesfully voted');
                    }
                });

              }
            });
        } else {
          response.end('Already voted');
        }
      }

  });
};



module.exports.createLocation = function(request, response) {
  postgres.createGroup(request.body.location, request.body.latitude, request.body.longitude,
    request.body.name, request.body.description, request.body.creator,
    request.body.public, request.body.open, function(success) {
      if (success) {
        response.end('group successfully created');
      } else {
        response.end('error creating group');
      }
    });
};

module.exports.createChannel = function(request, response) {

};






