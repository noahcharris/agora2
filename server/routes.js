
var postgres = require('./postgres.js');

var pg = require('pg');
var nodemailer = require('nodemailer');
var url = require('url');
//var Memcached = require('memcached');
//var amqp = require('amqplib');
//var when = require('when');
var bcrypt = require('bcrypt');
var s3 = require('s3');

var multiparty = require('multiparty');

var cookie = require('cookie');

var _ = require('underscore');

var Q = require('q');

//var treeBuilder = require('../workers/treebuilder.js');




//password hashing
bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash('secret', salt, function(err, hash) {
      // Store hash in your password DB.
  });
});





//Memcached and RabbitMQ connections
//var connection = amqp.connect('amqp://localhost')
var q = 'tasks';

// Have to include port number in the connection string or it won't work
//var memcached = new Memcached('127.0.0.1:11211');



//####################
//####  Postgres  ####
//####################
//var conString = 'postgres://noahharris@localhost:5432/noahharris';
var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';
var client = new pg.Client(conString);
client.connect();


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


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'agora.reporter@gmail.com',
        pass: 'fieldsoffallensoldiers'
    }
});





module.exports.test = function(request, response) {

  //need a list of servers that I can iterate through to set all the servers
  //response.setHeader('Access-Control-Allow-Origin', 'http://liveworld.io');

  // response.cookie('stealty',666, { maxAge: 900000, httpOnly: true, secure: true });


  // console.log("SESSION: ", request.session);
  

  // request.session.soid(function(data) {
  //   console.log('SESSION DATA: ', data);
  // });

  // request.mySession.hello = 'hi';

  // if (request.mySession.seenyou) {
  //   response.setHeader('X-Seen-You', 'true');
  // } else {
  //   response.setHeader('X-Seen-You', 'false');
  // }


  // if (request.mySession.seenyou) {
  //   response.setHeader('X-Seen-You', 'true');
  // } else {
  //   // setting a property will automatically cause a Set-Cookie response
  //   // to be sent
  //   request.mySession.seenyou = true;
  //   response.setHeader('X-Seen-You', 'false');
  // }

};






/********************************************/
/***          VALIDATORS               ******/
/********************************************/

//these return false if input is not valid
//

var whitelists = require('./whitelists.js');

function usernameValidator(input) {

  if (typeof input !== 'string')
    return false;
  if (input.length > 35)
    return false;

  var matchFound = false;
  for (var i=0; i < whitelists.alphabet.length ;i++) {
    if (input[0] === whitelists.alphabet[i]) {
      matchFound = true;
      break;
    }
  }
  if (!matchFound)
    return false;

  return input;

};

function passwordValidator(input) {

};



function xssValidator(input) {

  var result = input;

  if (typeof result !== 'string') {
    return false;
  }

  //DANGER! Leaving forward slash out for now because it totally fucks with the channel/location hierarchy.
  var translator = {'&':'&amp', '<':'&lt', '>':'&gt', '"':'&quot', "'":'&#x27',/*'/':'&#x2F'*/}

  for (var key in translator) {
    result = result.split(key).join(translator[key]);
  }

  return result;

  //report attempted xss attacks

};



function spamValidator(input) {

};


/********************************************/
/***   TOPICS WITH FILTERS METHODS     ******/
/********************************************/
module.exports.getTopTopicsDay = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;
  var channel = queryArgs.channel;
  var page = queryArgs.page;

  //PAGINATION OFFSET
  var offset = 15*(page - 1);

  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +" ORDER BY rank DESC LIMIT 15 OFFSET $3;",
    //!!!! the concatenated % allows postgres to match, so the cascading effect occurs
    [location + '%', channel + '%', offset],
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
  var page = queryArgs.page;
  //PAGINATION OFFSET
  var offset = 15*(page - 1);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY rank DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
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
  var page = queryArgs.page;

  //PAGINATION OFFSET
  var offset = 15*(page - 1);

  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY rank DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
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
  var page = queryArgs.page;

  //PAGINATION OFFSET
  var offset = 15*(page - 1);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY rank DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
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
  var page = queryArgs.page;

  //PAGINATION OFFSET
  var offset = 15*(page - 1);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY rank DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
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
  var page = queryArgs.page;

  //PAGINATION OFFSET
  var offset = 15*(page - 1);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY createdAt DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
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
  var page = queryArgs.page;

  console.log('location: ', location);
  console.log('channel: ', channel);

  //PAGINATION OFFSET
  var offset = 15*(page - 1);


  client.query("SELECT * FROM topics WHERE (location LIKE $1 AND channel LIKE $2) "
    +"ORDER BY heat DESC LIMIT 15 OFFSET $3;",
    [location+'%', channel+'%', offset],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics: ', err);
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });

};








//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆  BUILD TOPIC TREE         ∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆


//TODO: CACHING !!!!!!!!!! THIS IS THE FIRST CACHING I NEED TO DOOOOO!!!!!!!!!!!!

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



















//I DON'T THINK I NEED THIS ROUTE!!! I'M PRETTY SURE I'M ALREADY SENDING
// THE DATA ALONG WITH THE TOPICS THE FIRST TIME

module.exports.getTopicLocations = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT locations FROM topics WHERE id=$1;",
      [queryArgs.topicId],
      function(err, result) {
        if (err) {
          console.log('error selecting from topics: ', err);
          response.end('error');
        } else {
          if (result.rows[0]) {
            response.json(result.rows[0].locations);
          } else {
            response.json([]);
          }
        }
  });


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

  console.log('user search input: ', queryArgs.input);

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



module.exports.validateUsername = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  client.query("SELECT * FROM users WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from users: ', err);
      } else {
          if (result.rows.length) {
            //username already taken
            response.end('Taken');
          } else {
            //username available
            response.end('Available');
          }
      }
  });


};




//maybe send back subtrees here
module.exports.locationSearch = function(request, response) {

    var queryArgs = url.parse(request.url, true).query;

    var input;
    if (queryArgs.input != '') {
      var parsedInput = queryArgs.input.split(' ');
      for (var i=0; i < parsedInput.length ;i++) {
        parsedInput[i] = parsedInput[i][0].toUpperCase() + parsedInput[i].slice(1,parsedInput[i].length);
      }
      input = parsedInput.join(' ');
    } else {
      input = '';
    }


    console.log(input);

    console.log('location search input: ', queryArgs.input);

    client.query("SELECT * FROM locations WHERE name LIKE $1;",
        ['%' + input + '%'],
        function(err, result) {
          if (err) {
            console.log('error searching locations with LIKE: ', err);
            response.end('error');
          } else {
            response.json(result.rows);
          }
    });

};

//maybe send back subtrees here
module.exports.channelSearch = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  var input;
  if (queryArgs.input != '') {
    var parsedInput = queryArgs.input.split(' ');
    for (var i=0; i < parsedInput.length ;i++) {
      parsedInput[i] = parsedInput[i][0].toUpperCase() + parsedInput[i].slice(1,parsedInput[i].length);
    }
    input = parsedInput.join(' ');
  } else {
    input = '';
  }

  client.query("SELECT * FROM channels WHERE name LIKE $1;",
      ['%' + input + '%'],
      function(err, result) {
        if (err) {
          console.log('error searching users with LIKE: ', err);
          response.end('error');
        } else {
          response.json(result.rows);
        }
  });

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





//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆  START DEFENDING CSRF  ∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆  WITH TOKEN SYSTEM     ∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆





module.exports.getContacts = function(request, response) {



  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {


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




        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select









};

module.exports.getMessageChains = function(request, response) {



  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                    
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


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select


};


module.exports.getMessageChain = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  console.log('get chain');
  console.log(queryArgs.contact, queryArgs.username);


  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

           

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


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select









};


//VULNERABLE
module.exports.getPoints = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  // postgres.retrievePointsWithinRadius(queryArgs.latitude, queryArgs.longitude, function(data) {
  //   response.json(data);
  // });

  client.query("SELECT * FROM locations "
    +"WHERE ST_DWithin(pointGeometry, ST_GeomFromText('POINT("+queryArgs.longitude+" "+queryArgs.latitude+")', 4269), 1000000000);", function(err, result) {
    if (err) {
      console.log('error retrieving points: ', err);
      response.end('server error');
    } else {
      response.json(result.rows);
    }
  });


};



//VULNERABLE
module.exports.getPlaceLatLng = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;
  client.query("SELECT * FROM locations WHERE name = $1;",
    [queryArgs.name], function(err, result) {
      if (err) {
        console.log('error selecting from locations');
        response.end('error');
      } else {
        response.json(result.rows)
      }
  });



};




module.exports.getHeatPoints = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  client.query("SELECT location From topics "
    +"WHERE location LIKE $1 AND channel LIKE $2 ORDER BY heat DESC LIMIT 100;",
    [queryArgs.location+'%', queryArgs.channel+'%'], function(err, result) {
      if (err) {
        console.log('error selecting for heatPoints');
        response.end('error');
      } else {
        response.json(result.rows);
      }

  });



};






module.exports.getUser = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  client.query("SELECT * FROM users WHERE username = $1;", [queryArgs.username], function(err, result) {
      if (err) {
        console.log('error selecting from users: ', err);
      } else {
        response.json(result.rows);
      }
  });
};


module.exports.getRecentlyPostedTopics = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;
  client.query("SELECT * FROM topics WHERE username = $1 "
    +"ORDER BY createdAt DESC LIMIT 30;", [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from topics');
        response.end('error');
      } else {
        response.json(result.rows);
      }
  });


};


module.exports.getLocation = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  console.log(queryArgs);

  client.query("SELECT * FROM locations WHERE name = $1;",
    [queryArgs.location], function(err, result) {
      if (err) {
        console.log('error selecting from locations: ', err);
      } else {
        response.json(result.rows[0]);
      }
  });


};

module.exports.getChannel = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  console.log('hohoho: ', queryArgs.channel);

  client.query("SELECT * FROM channels WHERE name = $1;",
    [queryArgs.channel], function(err, result) {
      if (err) {
        console.log('error selecting from channel: ', err);
      } else {
        console.log(result.rows);
        response.json(result.rows[0]);
      }
  });
}



module.exports.getNotifications = function(request, response) {


  var queryArgs = url.parse(request.url, true).query;
  var notifications = {}; //master notifications object to send back at the end

  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        //need to add this to all of the security checks
        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

            //check for any pending contact requests
            client.query("SELECT * FROM contactRequestJoin WHERE (recipient = $1) ORDER BY sentAt DESC;",
              [queryArgs.username],
              function(err, result) {
                if (err) {
                  console.log('error selecting from contactRequestJoin: ', err);
                  response.end('error');
                } else {

                  notifications.contactRequests = result.rows;

                  client.query("SELECT * FROM contactRequestJoin WHERE (sender = $1);",
                    [queryArgs.username],
                    function(err, result) {
                      if (err) {
                        console.log('error selecting from contactRequestJoin: ', err);
                      } else {

                        notifications.sentRequests = result.rows;

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
                              });//end topicActivityJoin select

                              //THE STEPPES

                            }
                        });//end newMessageJoin select

                      }
                    });//end newMessageJoin select

                  //OF WOE

                }
            });//end contactJoin select








        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select



};
















module.exports.login = function(request, response) {





  // var rejection = function () {
  //   response.end('False');
  // };

  // var deferred = Q.defer();
  // postgres.retrieveUser(request.body.username, function(data) {
  //   if (data[0]) {
  //     deferred.resolve(data);
  //   } else {
  //     console.log(1);
  //     deferred.reject(new Error());
  //   }
  // });

  // return deferred.promise
  // .then(function(data) {

  //   var deferred = Q.defer();

  //   bcrypt.compare(request.body.password, data[0].passhash, function(err, res) {
  //     if (res) {
  //       deferred.resolve(res);
  //     } else {
  //       //LOGIN FAILED
  //       console.log(2);
  //       deferred.reject(new Error());
  //     }
  //   });
  //   return deferred.promise;

  // }, function() {
  //   //authentication failed
  //   response.end('False');
  // })
  // .then(function(res) {

  //   var deferred = Q.defer();

  //   //insert into security join
  //   client.query("DELETE FROM securityJoin WHERE username = $1;",
  //     [request.body.username], function(err, result) {
  //       if (err) {
  //         console.log('error deleting from securityJoin: ', err);
  //         reject(new Error());
  //       } else {
  //         deferred.resolve();
  //       }
  //   });

  //   return deferred.promise;
  // }, function() {
  //   //authentication failed
  //   response.end('False');
  // })
  // .then(function() {

  //   console.log('fuck');

  //   client.query ("INSERT INTO securityJoin (username, cookie, token, registeredAt) "
  //     +"VALUES ($1, $2, $3, now());",
  //     [request.body.username, cookie, token],
  //     function(err, result) {
  //       if (err) {
  //         console.log('error inserting into securityJoin: ', err);
  //       } else {

  //         console.log('whaaaa');
  //         //LOGIN SUCCESSFUL


  //         var token = Math.floor(Math.random()*100000000000000000001); //generate token here
  //         var cookie = Math.floor(Math.random()*1000000000000000000001);  //generate cookie here

  //         //set cookie which will be checkd in checkLogin (10 minutes here)
  //         // response.cookie('login','noahcharris12938987439', { maxAge: 600000, httpOnly: true });
  //         response.cookie('login', request.body.username+'/'+cookie, { maxAge: 300000, httpOnly: true, secure: true });

  //         console.log('Login successful for user: ', request.body.username);

  //         response.json({ login: true, token: token });


  //       }
  //   });

  // });





  postgres.retrieveUser(request.body.username, function(data) {
    if (data[0]) {

      bcrypt.compare(request.body.password, data[0].passhash, function(err, res) {
        if (res) {
            //insert into security join
            client.query("DELETE FROM securityJoin WHERE username = $1;",
              [request.body.username], function(err, result) {
                if (err) {
                  console.log('error deleting from securityJoin: ', err);
                  response.end('server error');
                } else {
                  //∆∆∆∆∆∆∆∆∆ GENERATE TOKEN AND COOKIE ∆∆∆∆∆∆∆∆∆∆∆∆
                  var token = Math.floor(Math.random()*100000000000000000001); //generate token here
                  var cookie = Math.floor(Math.random()*1000000000000000000001);  //generate cookie here
                  client.query ("INSERT INTO securityJoin (username, cookie, token, registeredAt) "
                    +"VALUES ($1, $2, $3, now());",
                    [request.body.username, cookie, token],
                    function(err, result) {
                      if (err) {
                        console.log('error insertin into securityJoin: ', err);
                        response.end('server error');
                      } else {
                          //LOGIN SUCCESSFUL
                          //set cookie which will be checkd in checkLogin (10 minutes here)
                          // response.cookie('login','noahcharris12938987439', { maxAge: 600000, httpOnly: true });
                          response.cookie('login',request.body.username+'/'+cookie, { maxAge: 30000000, httpOnly: true, secure: true });
                          console.log('Login successful for user: ', request.body.username);
                          response.json({ login: true, token: token });
                      }
                  });//end security join insert
                }
            });//end security join delete
        } else {
          //LOGIN FAILED
          console.log('login failed');
          response.end('incorrect password');
        }
      });

    } else {

      client.query("SELECT * FROM users WHERE email = $1",
        [request.body.username], function(err, result) {
          if (err) {
            console.log('error selecting from users by email');
            response.end('server error');
          } else {

            if (result.rows.length) {

              //Successfully looked up user by email
              bcrypt.compare(request.body.password, result.rows[0].passhash, function(err, res) {
                if (res) {
                    //insert into security join
                    client.query("DELETE FROM securityJoin WHERE username = $1;",
                      [request.body.username], function(err, result) {
                        if (err) {
                          console.log('error deleting from securityJoin: ', err);
                        } else {
                          //∆∆∆∆∆∆∆∆∆ GENERATE TOKEN AND COOKIE ∆∆∆∆∆∆∆∆∆∆∆∆
                          var token = Math.floor(Math.random()*100000000000000000001); //generate token here
                          var cookie = Math.floor(Math.random()*1000000000000000000001);  //generate cookie here
                          client.query ("INSERT INTO securityJoin (username, cookie, token, registeredAt) "
                            +"VALUES ($1, $2, $3, now());",
                            [request.body.username, cookie, token],
                            function(err, result) {
                              if (err) {
                                console.log('error insertin into securityJoin: ', err);
                              } else {
                                  //LOGIN SUCCESSFUL
                                  //set cookie which will be checkd in checkLogin (10 minutes here)
                                  // response.cookie('login','noahcharris12938987439', { maxAge: 600000, httpOnly: true });
                                  response.cookie('login',request.body.username+'/'+cookie, { maxAge: 30000000, httpOnly: true, secure: true });
                                  console.log('Login successful for user: ', request.body.username);
                                  response.json({ login: true, token: token });
                              }
                          });//end security join insert
                        }
                    });//end security join delete
                } else {
                  //LOGIN FAILED
                  console.log('login failed');
                  response.end('incorrect password');
                }
              });


            } else {
              //COULDN'T LOOK UP USER BY USERNAME OR EMAIL
              response.end("couldn't find user in database");
            }



          }
        })


    }
  });


};




















module.exports.logout = function(request, response) {



  var queryArgs = url.parse(request.url, true).query;


  client.query("SELECT * FROM securityJoin WHERE username = $1 ORDER BY registeredAt DESC;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {




          client.query("DELETE FROM securityJoin WHERE username = $1",
            [queryArgs.username],
            function(err, result) {
              if (err) {
                console.log('error deleting from securityJoin: ', err);
              } else {

                //delete row from security join
                response.cookie('login','0/0', { maxAge: 900000, httpOnly: true });
                response.end('True');
                

              }
          });


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select






};


module.exports.checkLogin = function(request, response) {


  if (request.cookies['login']) {


    client.query("SELECT * FROM securityJoin WHERE username = $1 ORDER BY registeredAt DESC;",
      [request.cookies['login'].split('/')[0]], function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {
          if (result.rows.length > 0) {


            if (request.cookies['login'] && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {
              //respond with token
              response.json({ login: true, token: result.rows[0].token, username: request.cookies['login'].split('/')[0] });

            } else {
              console.log('unauthorized access');
              response.json({});
            }


          } else {
            console.log('no record found');
            response.json({});
          };
        };
    });


  } else {
    console.log('no cookie found');
    response.json({});
  }




};




























/***************************/
/***************************/
/***  CREATION ROUTES    ***/
/***************************/
/***************************/


module.exports.addContact = function(request, response) {

  console.log(request.body.username);
  console.log(request.body.contact);




  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (result.rows.length) {

            if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                        client.query("SELECT * FROM contactRequestJoin WHERE (sender=$1 AND recipient = $2)",
                            [request.body.contact, request.body.username],
                            function(err, result) {
                              if (err) {
                                console.log('error selecting from contactRequestJoin: ', err);
                                response.end('error');
                              } else {

                                //ONCE WE CHECK

                                //IF THERE IS AN ENTRY THEN INSERT INTO CONTACTSJOIN
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
                        


            } else {
              response.end('not authorized');
            }

          }

        }





  });//end securityJoin select



  






};






//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//  XSS VULNERABILITIES START HERE
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
//∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆




module.exports.createMessageChain = function(request, response) {






  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                

          client.query("SELECT * FROM messageChains WHERE (username1=$1 AND username2=$2) "
            +"OR (username1=$2 AND username2=$1);",
            [request.body.username, request.body.contact],
            function(err, result) {
              if (err) {
                console.log('error selecting from messageChains: ', err);
                response.end('error');
              } else {

                if (result.rows.length === 0) {

                  client.query("INSERT INTO messageChains (type, username1, username2) "
                    +"VALUES ('MessageChain', $1, $2);",
                    [xssValidator(request.body.username), xssValidator(request.body.contact)],
                    function(err, result) {
                      if (err) {
                        console.log('error inserting into messageChains: ', err);
                        response.end('error');
                      } else {
                        response.end('successfully created messageChain');
                      }
                  });

                } else {
                  response.end('messageChain already in database');
                }

              }
          });



        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select











};


module.exports.sendMessage = function(request, response) {





  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                    client.query("INSERT INTO messages (type, sender, recipient, contents, sentAt) "
                      +"VALUES ('Message', $1, $2, $3, now());",
                        [xssValidator(request.body.sender), xssValidator(request.body.recipient), xssValidator(request.body.contents)],
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
                    


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select



};



module.exports.checkUsername = function(request, response) {


};




module.exports.registerUser = function(request, response) {

  var temp = request.body.username;
  var flag = false;
  for (var i=0; i < temp.length ;i++) {
    if (temp[i] === '@') {
      flag = true;
    }
  }
  if (flag) {
    response.end("username may not contain '@'");
  } else {

    client.query("SELECT * FROM users WHERE username = $1;",
      [request.body.username], function(err, result) {
        if (err) {
          console.log('error selecting from users: ', err);
        } else {
          if (result.rows.length) {
            //username unavailable
            response.end('That username is taken!');
          } else {
            //USERNAME AVAILABLE!!!!

            //CHECK EMAIL NOW
            client.query("SELECT * FROM users WHERE email = $1;",
              [request.body.email], function(err, result) {
                if (err) {
                  console.log('error selecting from users: ', err);
                } else {
                  if (result.rows.length) {
                    //email unavailable
                    response.end('That email is taken!');
                  } else {

                      //REGISTER THE USER
                      bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(request.body.password, salt, function(err, hash) {

                          postgres.createUser(xssValidator(request.body.username), hash, salt, 
                            xssValidator(request.body.origin), xssValidator(request.body.about),
                            xssValidator(request.body.email), function(success) {
                              if (success) {
                                //send back login token here????


                                //GENERATE EMAIL VERIFICATION SECRET, INSERT INTO JOIN AND SEND EMAIL
                                var secret = Math.floor(Math.random()*100000000001);
                                client.query("INSERT INTO emailVerificationJoin (username, secret, registeredAt) "
                                  +"VALUES ($1, $2, now());",
                                  [request.body.username, secret],
                                  function(err, result) {
                                    if (err) {
                                      console.log('error inserting into emailVerificationJoin: ', err);
                                    } else {

                                      var mailOptions = {
                                          from: 'Agora ✔ <agora.reporter@gmail.com>', // sender address
                                          to: request.body.email, // list of receivers
                                          subject: 'Hello ✔', // Subject line
                                          text: 'KEY', // plaintext body
                                          html: '<b>SECRET: '+secret+' ✔</b>' // html body
                                      };

                                      transporter.sendMail(mailOptions, function(error, info){
                                          if(error){
                                              console.log(error);
                                          }else{
                                              console.log('Message sent: ' + info.response);
                                          }
                                      });



                                    }
                                });


                                var token = Math.floor(Math.random()*100000000000000000001); //generate token here
                                var cookie = Math.floor(Math.random()*1000000000000000000001);  //generate cookie here

                                // response.cookie('login','noahcharris12938987439', { maxAge: 600000, httpOnly: true });

                                client.query ("INSERT INTO securityJoin (username, cookie, token, registeredAt) "
                                  +"VALUES ($1, $2, $3, now());",
                                  [request.body.username, cookie, token],
                                  function(err, result) {
                                    if (err) {
                                      console.log('error inserting into securityJoin: ', err);
                                    } else {
                                      //LOGIN SUCCESSFUL

                                      //set cookie which will be checkd in checkLogin (10 minutes here)
                                      // response.cookie('login','noahcharris12938987439', { maxAge: 600000, httpOnly: true });
                                      response.cookie('login', request.body.username+'/'+cookie, { maxAge: 300000, httpOnly: true, secure: true });

                                      console.log('Login successful for user: ', request.body.username);

                                      response.json({ login: true, token: token });


                                    }
                                });

                              } else {
                                response.end('error creating user');
                              }
                          });//end create user

                        });
                      });//end bcrypt async thing


                  }
                }
            });//end email check

          }
        }
    });//end username check from users

  }//end username @ check

};






module.exports.verifyUser = function(request, response) {


  //CHECK THE SECRET AGAINST THE TABLE, IF IT MATCHES DELETE THE ENTRY AND UPDATE USERS TABLE
  //need to reschematize users table for this to work fully



};








module.exports.visitedTopic = function(request, response) {





  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {



                    //add some heat yo
                    addVisitHeat(request.body.username, request.body.topicId);


                    client.query("SELECT * FROM topicVisitJoin JOIN topics ON topicVisitJoin.username = $1 "
                      +"AND topicVisitJoin.topic = topics.id ORDER BY visitedAt DESC;",
                      [request.body.username],
                      function(err, result) {
                        if (err) {
                          console.log('error selecting from topicVisitJoin: ', err);
                        } else {

                          //handle the case of no topics
                          if (!result.rows.length)
                            result.rows = [{id:-1}];

                          // console.log('typeof result id: ', typeof result.rows[0].id, ' typeof request id: ', typeof request.body.topicId);


                          if (result.rows[0].id != request.body.topicId) {


                            client.query("INSERT INTO topicVisitJoin (username, topic, visitedAt) "
                              +"VALUES ($1, $2, now());",
                              [request.body.username, request.body.topicId],
                              function(err, result) {
                                if (err) {
                                  console.log('error inserting into topicVisitJoin: ', err);
                                } else {
                                  response.end('successfully visited topic');
                                }
                            });




                          } else {
                            response.end('no insertion; this is already the most recent topic');
                          }




                   
                        }
                    });//end topicVisitJoin select
                    



        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select







};




module.exports.recentlyVisitedTopics = function(request, response) {


  var queryArgs = url.parse(request.url, true).query;

  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                    
            client.query("SELECT * FROM topicVisitJoin JOIN topics ON topicVisitJoin.username = $1 "
              +"AND topicVisitJoin.topic = topics.id ORDER BY visitedAt DESC;",
              [queryArgs.username],
              function(err, result) {
                if (err) {
                  console.log('error selecting from topicVisitJoin: ', err);
                } else {
                  response.json(result.rows);
                }
            });


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select

};



function addVisitHeat(username, topicId) {

  client.query("SELECT * FROM heatVisitJoin WHERE username = $1 AND topic = $2 "
    +"AND (visitedAt > now() - interval '1 hour');", [username, topicId],
    function(err, result) {
      if (err) {
        console.log('error selecting from heatVisitJoin');
      } else {

        if (!result.rows.length) {

          client.query("UPDATE topics SET heat = heat + 1 WHERE id = $1;",
            [topicId], function(err, result) {
            if (err) {
              console.log('error adding heat to topic: ', err);
            } else {
                //successfully added heat
                client.query("INSERT INTO heatVisitJoin (username, topic, visitedAt) "
                 +"VALUES ($1, $2, now());", [username, topicId],
                 function(err, result) {
                  if (err) {
                    console.log('error inserting into heatVisitJoin');
                  } else {
                  }
                });
            }
          });//end heat adding


        }//end check for rows

      }
  });//end heat visit select

};

function addPostHeat(username, topicId, heat) {

  client.query("SELECT * FROM heatPostJoin WHERE username = $1 AND topic = $2 "
    +"AND (postedAt > now() - interval '1 hour');", [username, topicId],
    function(err, result) {
      if (err) {
        console.log('error selecting from heatPostJoin');
      } else {

        if (!result.rows.length) {

          client.query("UPDATE topics SET heat = heat + "+heat+" WHERE id = $1;",
            [topicId], function(err, result) {
            if (err) {
              console.log('error adding heat to topic');
            } else {
                //successfully added heat
                client.query("INSERT INTO heatPostJoin (username, topic, postedAt) "
                 +"VALUES ($1, $2, now());", [username, topicId],
                 function(err, result) {
                  if (err) {
                    console.log('error inserting into heatPostJoin');
                  } else {
                  }
                });
            }
          });//end heat adding


        }//end check for rows

      }
  });//end heat post select

};

function addVoteHeat(username, topicId, heat) {

  client.query("SELECT * FROM heatVoteJoin WHERE username = $1 AND topic = $2 "
    +"AND (votedAt > now() - interval '1 hour');", [username, topicId],
    function(err, result) {
      if (err) {
        console.log('error selecting from heatVoteJoin');
      } else {

        if (!result.rows.length) {

          client.query("UPDATE topics SET heat = heat + "+heat+" WHERE id = $1;",
            [topicId], function(err, result) {
            if (err) {
              console.log('error adding heat to topic');
            } else {
                //successfully added heat
                client.query("INSERT INTO heatVoteJoin (username, topic, votedAt) "
                 +"VALUES ($1, $2, now());", [username, topicId],
                 function(err, result) {
                  if (err) {
                    console.log('error inserting into heatVoteJoin');
                  } else {
                  }
                });
            }
          });//end heat adding


        }//end check for rows

      }
  });//end heat vote select

};






module.exports.getRecentLocations = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  var deferred = Q.defer();

  console.log(queryArgs);

  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {
        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {
          //authorized
          deferred.resolve()

        } else {
          deferred.reject(new Error('authorization failed for getContactTopics'));
        }

      }
  });

  return deferred.promise
  .then(function() {

    //query for and return locations


  }, function() {
    response.end('not authorized');
  });


};


module.exports.getRecentChannels = function(request, response) {

    var queryArgs = url.parse(request.url, true).query;

    var deferred = Q.defer();

    console.log(queryArgs);

    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [queryArgs.username],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {
          if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {
            //authorized
            deferred.resolve()

          } else {
            deferred.reject(new Error('authorization failed for getContactTopics'));
          }

        }
    });

    return deferred.promise
    .then(function() {

      //query for and return channels



    }, function() {
      response.end('not authorized');
    });




};


module.exports.getContactTopics = function(request, response) {

  var queryArgs = url.parse(request.url, true).query;

  var deferred = Q.defer();

  console.log(queryArgs);

  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [queryArgs.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {
        if (request.cookies['login'] && queryArgs.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {
          //authorized
          console.log('whaaaajdaslfjdsla');
          deferred.resolve()

        } else {
          deferred.reject(new Error('authorization failed for getContactTopics'));
        }

      }
  });

  return deferred.promise
  .then(function() {

    var deferred = Q.defer();

    //the contactsJoin ID was conflicting with the topics ID
    //DO I EVEN NEED THAT TOPIC LOCATIONS ROUTE IF I AM SENDING IT WITH THE TOPIC ANYWAYS???
    //I DON'T THINK SO
    client.query("SELECT topics.id, authorOrigin, channel, contents, createdAt, editedAt, headline, heat, image, link, location, locations, participants, rank, type, username "
      +"FROM topics INNER JOIN contactsJoin ON "
      +"(contactsJoin.username1 = $1 AND topics.username = contactsJoin.username2 AND topics.location LIKE $2 AND topics.channel LIKE $3) "
      +"OR (contactsJoin.username2 = $1 AND topics.username = contactsJoin.username1 AND topics.location LIKE $2 AND topics.channel LIKE $3) "
      +"ORDER BY createdAt DESC LIMIT 15 OFFSET $4;",
      [queryArgs.username, queryArgs.location + '%', queryArgs.channel + '%', 15*(queryArgs.page - 1)], function(err, result) {
        if (err) {
          console.log('error selecting contacts topics');
          deferred.reject(new Error());
        } else {
          deferred.resolve(result.rows);
        }
    })
    return deferred.promise;

  }, function() {
    response.end('not authorized');
  })
  .then(function(data) {
    response.json(data);
  }, function() {
    response.end('error');
  });


};







module.exports.updateUserProfile = function(request, response) {

  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {


    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [fields.username[0]],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {

          if (request.cookies['login'] && fields.token[0] === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                        //if an image is sent
                        if (files.file) {

                          var keyString = xssValidator(fields.username[0]);

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
                              [xssValidator(fields.about[0]), imageLink, xssValidator(fields.username[0])],
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
                            [xssValidator(fields.about[0]), xssValidator(fields.username[0])],
                            function(err, result) {
                              if (err) {
                                console.log('error updating users table: ', err);
                              } else {
                                response.end('successfully updated profile (no image)');
                              }
                          });

                        }
                      


          } else {
            response.end('not authorized');
          }

        }
    });//end securityJoin select












  });






};

module.exports.updateLocationProfile = function(request, response) {
  response.end('TODO');
};

module.exports.updateChannelProfile = function(request, response) {
  response.end('TODO');
};









module.exports.createTopic = function(request, response) {




  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {



    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [fields.username[0]],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {

          if (request.cookies['login'] && fields.token[0] === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                      
                              //if an image is sent
                              if (files.file) {

                                      //insert and fetch id here, then upload the image to amazon

                                      client.query("INSERT INTO topics (type, username, headline, link, contents, location, locations, channel, createdAt, rank, heat)"
                                      +"VALUES ('Topic', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
                                      [xssValidator(fields.username[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), "{\""+xssValidator(fields.location[0])+"\"}", xssValidator(fields.channel[0])],
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


                                                            //I think I'm safe from XSS in here..

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
                                [xssValidator(fields.username[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), "{\""+xssValidator(fields.location[0])+"\"}", xssValidator(fields.channel[0])], 
                                function(err, result) {
                                  if (err) {
                                    console.log('error inserting into topics: ', err);
                                    response.end('error');
                                  } else {


                                    response.end('successfully created topic (no image)');
                                  }
                                });


                              }


          } else {
            response.end('not authorized');
          }

        }
    });//end securityJoin select





    

  });//end multiparty parse


};







module.exports.createComment = function(request, response) {






  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {



    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [fields.username[0]],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {

          if (request.cookies['login'] && fields.token[0] === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

              addPostHeat(fields.username[0], fields.topicId[0], 4);

              //if an image is sent
              if (files.file) {

                      //insert and fetch id here, then upload the image to amazon

                      client.query("INSERT INTO comments (type, username, topic, headline, link, contents, location, channel, createdAt, rank, heat)"
                      +"VALUES ('Comment', $1, $2, $3, $4, $5, $6, $7, now(), 0, 30);",
                      [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])],
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
                [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])], 
                function(err, result) {
                  if (err) {
                    console.log('error inserting into comments: ', err);
                    response.end('error');
                  } else {


                    response.end('successfully created comment (no image)');
                  }
                });


              }


          } else {
            response.end('not authorized');
          }

        }
    });//end securityJoin select


    






  });//end multiparty parse





};





module.exports.createResponse = function(request, response) {






  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {





    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [fields.username[0]],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {

          if (request.cookies['login'] && fields.token[0] === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                        addPostHeat(fields.username[0], fields.topicId[0], 3);
                      
                        //if an image is sent
                        if (files.file) {

                                //insert and fetch id here, then upload the image to amazon
                                client.query("INSERT INTO responses (type, username, topic, comment, headline, link, contents, location, channel, createdAt, rank, heat)"
                                +"VALUES ('Response', $1, $2, $3, $4, $5, $6, $7, $8, now(), 0, 30);",
                                [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.commentId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])],
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
                          [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.commentId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])], 
                          function(err, result) {
                            if (err) {
                              console.log('error inserting into responses: ', err);
                              response.end('error');
                            } else {


                              response.end('successfully created response (no image)');
                            }
                          });


                        }


          } else {
            response.end('not authorized');
          }

        }
    });//end securityJoin select



    

  });//end multiparty parse






};





module.exports.createReply = function(request, response) {






  var form = new multiparty.Form();

  form.parse(request, function(err, fields, files) {









    client.query("SELECT * FROM securityJoin WHERE username = $1;",
      [fields.username[0]],
      function(err, result) {
        if (err) {
          console.log('error selecting from securityJoin: ', err);
        } else {

          if (request.cookies['login'] && fields.token[0] === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                      
                    addPostHeat(fields.username[0], fields.topicId[0], 3);

                    //if an image is sent
                    if (files.file) {

                            //insert and fetch id here, then upload the image to amazon
                            client.query("INSERT INTO replies (type, username, topic, comment, response, headline, link, contents, location, channel, createdAt, rank, heat)"
                            +"VALUES ('Reply', $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), 0, 30);",
                            [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.commentId[0]), xssValidator(fields.responseId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])],
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
                      [xssValidator(fields.username[0]), xssValidator(fields.topicId[0]), xssValidator(fields.commentId[0]), xssValidator(fields.responseId[0]), xssValidator(fields.headline[0]), xssValidator(fields.link[0]), xssValidator(fields.contents[0]), xssValidator(fields.location[0]), xssValidator(fields.channel[0])], 
                      function(err, result) {
                        if (err) {
                          console.log('error inserting into replies: ', err);
                          response.end('error');
                        } else {


                          response.end('successfully created reply (no image)');
                        }
                      });


                    }


          } else {
            response.end('not authorized');
          }

        }
    });//end securityJoin select







  });//end multiparty parse


};













module.exports.createLocation = function(request, response) {


  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

              //capitalize the name
              var temp = request.body.name.split(' ');
              for (var i=0; i < temp.length ;i++) {
                temp[i] = temp[i][0].toUpperCase() + temp[i].slice(1, temp[i].length);
              }
              var name = temp.join(' ');

              //IF USER IS TRYING TO CREATE A PLACE WITH ANY PARENT BESIDES
              //A CITY, THEN DON'T ALLOW IT, (NEED TO PROVIDE STRICTURES & FEEDBACK IN CLIENT)

                    
              client.query("INSERT INTO locations (type, isUserCreated, name, description, parent, "
                +" creator, population, rank, public, pointGeometry, latitude, longitude) "
                +"VALUES ('Location', true, $1, $2, $3, $4, 0, 0, $5, ST_PointFromText($6, 4269), $7, $8);",
                [xssValidator(request.body.parent+'/'+name), xssValidator(request.body.description), xssValidator(request.body.parent), xssValidator(request.body.creator),
                request.body.pub, 'POINT('+request.body.longitude+' '+request.body.latitude+')', request.body.latitude, request.body.longitude],
                function(err, result) {
                  if (err) {
                    console.log('error inserting into locations: ', err);
                  } else {
                    response.end('successfully created location');
                  }
              });


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select








};




module.exports.createChannel = function(request, response) {




  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

            //capitalize the name
            var temp = request.body.name.split(' ');
            for (var i=0; i < temp.length ;i++) {
              temp[i] = temp[i][0].toUpperCase() + temp[i].slice(1, temp[i].length);
            }
            var name = temp.join(' ');
                    
            client.query("INSERT INTO channels (type, name, description, parent) "
              +"VALUES ('Channel', $1, $2, $3);",
              [xssValidator(request.body.parent+'/'+name), xssValidator(request.body.description), xssValidator(request.body.parent)],
              function(err, result) {
                if (err) {
                  console.log('error inserting into channels: ', err);
                } else {
                  response.end('successfully created channel');
                }
            });


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select

  





};
















module.exports.upvoteTopic = function(request, response) {





  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {



              client.query("SELECT * FROM topicVoteJoin where (username=$1 AND topic=$2);",
                [request.body.username, request.body.topicId],
                function(err, result) {
                  if (err) {
                    console.log('error selecting from topicVoteJoin: ', err);
                    //should i just send the error back here?
                    response.end('error');
                  } else {
                    if (result.rowCount === 0) {


                      addVoteHeat(request.body.username, request.body.topicId, 3);


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
                    


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select



};



module.exports.upvoteComment = function(request, response) {



  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {

        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {


                    client.query("SELECT * FROM commentVoteJoin where (username=$1 AND comment=$2);",
                      [request.body.username, request.body.commentId],
                      function(err, result) {
                        if (err) {
                          console.log('error selecting from commentVoteJoin: ', err);
                          //should i just send the error back here?
                          response.end('error');
                        } else {
                          if (result.rowCount === 0) {

                            addVoteHeat(request.body.username, request.body.topicId, 2);

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
                    


        } else {
          response.end('not authorized');
        }

      }
  });//end securityJoin select

  

};

module.exports.upvoteResponse = function(request, response) {



  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {
        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {


              client.query("SELECT * FROM responseVoteJoin where (username=$1 AND response=$2);",
                [request.body.username, request.body.responseId],
                function(err, result) {
                  if (err) {
                    console.log('error selecting from responseVoteJoin: ', err);
                    //should i just send the error back here?
                    response.end('error');
                  } else {
                    if (result.rowCount === 0) {

                      addVoteHeat(request.body.username, request.body.topicId, 2);

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
                    



        } else {
          response.end('not authorized');
        }
      }
  });//end securityJoin select

  
};

module.exports.upvoteReply = function(request, response) {



  client.query("SELECT * FROM securityJoin WHERE username = $1;",
    [request.body.username],
    function(err, result) {
      if (err) {
        console.log('error selecting from securityJoin: ', err);
      } else {
        if (request.cookies['login'] && request.body.token === result.rows[0].token && request.cookies['login'].split('/')[1] === result.rows[0].cookie) {

                

                client.query("SELECT * FROM replyVoteJoin where (username=$1 AND reply=$2);",
                  [request.body.username, request.body.replyId],
                  function(err, result) {
                    if (err) {
                      console.log('error selecting from replyVoteJoin: ', err);
                      //should i just send the error back here?
                      response.end('error');
                    } else {
                      if (result.rowCount === 0) {


                        addVoteHeat(request.body.username, request.body.topicId, 2);

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



        } else {
          response.end('not authorized');
        }
      }
  });//end securityJoin select



  
};










































