
var postgres = require('./postgres.js');

var pg = require('pg');
var url = require('url');
var Memcached = require('memcached');
var amqp = require('amqplib');
var when = require('when');
var bcrypt = require('bcrypt');

var cookie = require('cookie');




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

















/********************************************/
/***   TOPICS WITH FILTERS METHODS     ******/
/********************************************/







module.exports.getTopTopicsDay = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;


  var location = queryArgs.location;
  var channel = queryArgs.channel;

  //testing memcached !!!!!!!!!!!!!!!!!
  if (queryArgs.location === '')
    location = 'World';


  var keyString = location + '~' + channel + '~TopTopicsDay';

  response.json(false);

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




};







module.exports.getTopTopicsWeek = function(request, response) {
  //TODO
    response.json(false);

};

module.exports.getTopTopicsMonth = function(request, response) {
  //TODO
    response.json(false);
};

module.exports.getTopTopicsYear = function(request, response) {
  //TODO
    response.json(false);

};

module.exports.getTopTopicsTime = function(request, response) {
  //TODO
    response.json(false);

};


module.exports.getNewTopics = function(request, response) {
  var topicsCollection = [{ id: 1,
      headline: 'Defaults are desecrets',
      type: 'Topic',
      poster: 'thalonius want',
      contents: 'Unce more breach. Twice too many.',
      city: 'Oregon',
      area: 'Hack Reactor',
      reputation: 42,
      upvoted: true,
      expanded: true,   //this is for the outer expansion/contraction button
      comments: [{
        id: 22,
        poster: 'J-aldrean',
        headline: 'suck it',
        contents: 'This dream, no more a dream than waking',
        upvoted: true,
        expanded: false,    //these are for each group of replies
        replies: [{
            poster: 'Mr. Bean',
            headline: 'my dick',
            contents: 'You sir, are a ruffian.',
            upvoted: false,
        }, {
            poster: 'Mr. Bean',
            headline: 'my dick',
            contents: 'I mean it..',
            upvoted: false,
        }]
      }, {
        id: 87,
        poster: 'Jason Aldean',
        headline: 'suck it',
        contents: 'Ok, but how about them yanks?',
        upvoted: false,
        expanded: false,
        replies: [{
            poster: 'Heckles',
            headline: 'wow',
            contents: 'Just the one.'
        }]
      }] 
    }];

    response.json(topicsCollection);
};

module.exports.getHotTopics = function(request, response) {
  var topicsCollection = [{ id: 1,
      headline: 'Defaults are desecrets',
      type: 'Topic',
      poster: 'nyeah',
      contents: 'Unce more breach. Twice too many.',
      city: 'Oregon',
      area: 'Hack Reactor',
      reputation: 42,
      upvoted: true,
      expanded: true,   //this is for the outer expansion/contraction button
      comments: [{
        id: 22,
        poster: 'J-aldrean',
        headline: 'suck it',
        contents: 'This dream, no more a dream than waking',
        upvoted: true,
        expanded: false,    //these are for each group of replies
        replies: [{
            poster: 'Mr. Bean',
            headline: 'my dick',
            contents: 'You sir, are a ruffian.',
            upvoted: false,
        }, {
            poster: 'Mr. Bean',
            headline: 'my dick',
            contents: 'I mean it..',
            upvoted: false,
        }]
      }, {
        id: 87,
        poster: 'Jason Aldean',
        headline: 'suck it',
        contents: 'Ok, but how about them yanks?',
        upvoted: false,
        expanded: false,
        replies: [{
            poster: 'Heckles',
            headline: 'wow',
            contents: 'Just the one.'
        }]
      }] 
    }];

    response.json(topicsCollection);
};

module.exports.getTopicTree = function(request, response) {

  response.end('TODO');

};

module.exports.getTopicLocations = function(request, response) {

  response.end('TODO');

};


//##########################################
//############  SEARCHES    ################
//##########################################


module.exports.topicSearch = function(request, response) {

  response.end('TODO');
    //TODO
};

module.exports.userSearch = function(request, response) {
    //TODO
  response.end('TODO');
};



module.exports.locationSearch = function(request, response) {

    var returnCollection = [];
    response.json(returnCollection);

};

module.exports.channelSearch = function(request, response) {

  var returnCollection = [];
  response.json(returnCollection);

};

module.exports.getLocationSubtree = function(request, response) {
  response.end('TODO');
};

module.exports.getChannelSubtree = function(response, request) {
  response.end('TODO');
};


module.exports.getContacts = function(request, response) {
  response.end('TODO');
};

module.exports.getMessages = function(request, response) {
  response.end('TODO');
};

module.exports.getMessageChain = function(request, response) {
  response.end('TODO');
};


module.exports.getPoints = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrievePointsWithinRadius(queryArgs.latitude, queryArgs.longitude, function(data) {
    response.json(data);
  });
};


module.exports.getUser = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrieveUser(queryArgs.username, function(data) {
    console.log('sending user data for ', queryArgs.username, ' to client');
    response.json(data);
  });
};

module.exports.getUserLocations = function(request, response) {

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

  //clear notifications out of the database when they are sent to the client
  response.end('TODO');
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
  response.end('TODO');
};


module.exports.sendMessage = function(request, response) {
  response.end('TODO');
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
        request.body.origin, function(success) {
          if (success) {
            response.end('successfully created user');
          } else {
            response.end('error creating user');
          }
      });
    });
  });

};



module.exports.updateUserProfile = function(request, response) {
  response.end('TODO');
};

module.exports.updateLocationProfile = function(request, response) {
  response.end('TODO');
};






module.exports.createTopic = function(request, response) {

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  //AUTHENTICATION HERE
  //console.log('request.session.login: ', request.session.login);
  console.log(request.mySession);

  if (request.mySession.login) {

    //call accepts true or false depending on whether the request failed or not
    postgres.createTopic(request.body.headline, request.body.link,
     request.body.content, request.body.location, request.body.channel, request.body.rank, function(success) {
      if (success) {

        //PUT MESSAGE IN QUEUE
        connection.then(function(conn) {
          var ok = conn.createChannel();
          ok = ok.then(function(ch) {
            ch.assertQueue(q);



            // Scheme for treebuilder messages: <task>~<location>~<channel>~<TopTopics/NewTopics/HotTopics>
            var msg = 'Trees:'+request.body.location+':'+request.body.channel;



            ch.sendToQueue(q, new Buffer(msg));
            console.log(" [x] Sent '%s'", msg);
          });
          return ok;
        }).then(null, console.warn);

        response.end('topic successfully created, sent message to queue');

      } else {
        response.end('error inserting into topics');
      }


    });
  } else {
    response.end('you can\'t submit a message if you are not logged in');
  }


};




module.exports.createComment = function(request, response) {
  postgres.createComment(request.body.location, request.body.group, 
    request.body.topic, request.body.headline, request.body.content, function(success) {
    if (success) {
      response.end('successfully created comment');
      //put message in the queue
      connection.then(function(conn) {
        var ok = conn.createChannel();
        ok = ok.then(function(ch) {
          ch.assertQueue(q);
          // Here we are sending the tree:<path>:<filter> command
          var msg = 'Tree:'+request.body.location;
          ch.sendToQueue(q, new Buffer(msg));
          console.log(" [x] Sent '%s'", msg);
        });
      });
    } else {
      response.end('error creating comment');
    }
  });
};

module.exports.createResponse = function(request, response) {
response.end('TODO');
  //TODO

};

module.exports.createReply = function(request, response) {
  postgres.createReply(request.body.location, request.body.group, 
    request.body.topic, request.body.comment, request.body.headline, 
    request.body.content, function(success) {
    if (success) {
      response.end('successfully created reply');
      //put message in the queue
      connection.then(function(conn) {
        var ok = conn.createChannel();
        ok = ok.then(function(ch) {
          ch.assertQueue(q);
          // Here we are sending the tree:<path>:<filter> command
          var msg = 'Tree:'+request.body.location;
          ch.sendToQueue(q, new Buffer(msg));
          console.log(" [x] Sent '%s'", msg);
        });
      });
    } else {
      response.end('error creating reply');
    }
  });
};



module.exports.upvoteTopic = function(request, response) {
response.end('TODO');
};

module.exports.upvoteComment = function(request, response) {
  response.end('TODO');
};

module.exports.upvoteResponse = function(request, response) {
  response.end('TODO');
};

module.exports.upvoteReply = function(request, response) {
  response.end('TODO');
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






