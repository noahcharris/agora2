
var url = require('url');
var postgres = require('./postgres.js');
var Memcached = require('memcached');
var amqp = require('amqplib');
var when = require('when');
var bcrypt = require('bcrypt');

var tb = require('./../workers/treebuilder.js');




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




// ## SETUP CONSISTENT MESSAGE TIMERS ##

//am i creating zombies when I make all these brief connections with memcached?? Need to research.

function memcachedTimers() {

  connection.then(function(conn) {
    var ok = conn.createChannel();
    ok = ok.then(function(ch) {
      ch.assertQueue(q);
      // Here we are sending the tree:<path>:<filter> command
      var msg = 'Tree:';
      ch.sendToQueue(q, new Buffer('Tree:'));
      ch.sendToQueue(q, new Buffer('Tree:France'));
      //console.log(" [x] Sent '%s'", msg);
    });
    return ok;
  }).then(null, console.warn);

}

memcachedTimers();
setInterval(memcachedTimers, 100000);

//#####################################










module.exports.danceParty = function(request, response) {
  //console.log('dance, dance, dance', request.session.email);
  //request.session.email = 'hello';
  //postgres.setupPostGIS();
    postgres.createTables();
  //postgres.populateSubgroups();
  //postgres.populateGroups();
  //postgres.populateTopics();
  //postgres.populatePlaces();
  response.end('woooohoooo');
}

module.exports.getPoints = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrievePointsWithinRadius(queryArgs.latitude, queryArgs.longitude, function(data) {
    response.json(data);
  });
};


module.exports.getGroupForPath = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  console.log('going to look up ', queryArgs.group, ' at ', queryArgs.location);
  postgres.getGroupForPath(queryArgs.location, queryArgs.group, function(data) {
    response.json(data);
  });
};



module.exports.getGroups = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrieveGroups(queryArgs.location, function(data) {
    response.json(data);
  });
};

module.exports.getSubgroups = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrieveSubgroups(queryArgs.location, queryArgs.group, function(data) {
    console.log('sending subgroups to client');
    response.json(data);
  });
};







module.exports.getTopics = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;

  var location = queryArgs.location;

  //testing memcached !!!!!!!!!!!!!!!!!
  if (queryArgs.location === '')
    location = 'World';

  //will have to use string replace in memcache queries
  // location = location.replace(' ','#');

  console.log('pulling out of memcached to send to client')
  memcached.get(location, function (err, data) {
    if (err) {
      console.log('error pulling tree out of memcache for ', location);
      console.log(err);
      tb.build(queryArgs.location, function(data) {
          console.log('sending data back to client after building it');
          response.json(data);
      });

    } else {    

      if (data) {
        console.log('sending data from memcached to client');
        response.json(data);
      } else {

        console.log('could not find topic trees in memcached, proceeding to build from postgres');
        //need to build the trees either here or client side if there is an error

        // callback to get the data from tree builder after it inserts into memcached
        tb.build(queryArgs.location, function(data) {
          console.log('sending data back to client after building it');
          response.json(data);
        });



        // postgres.retrieveTopics(queryArgs.location, function(data) {
        //   response.json(data);
        // });
      }

    }

  });

};

module.exports.getGroupTopics = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrieveGroupTopics(queryArgs.location, queryArgs.group, function(data) {
    console.log('sending group topics to client');
    response.json(data);
  });
};

module.exports.getSubgroupTopics = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrieveSubgroupTopics(queryArgs.location, queryArgs.group, queryArgs.name, function(data) {
    console.log('sending subgroup topics to client');
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


module.exports.getPlace = function(request, response) {
  var queryArgs = url.parse(request.url, true).query;
  postgres.retrievePlace(queryArgs.location, function(data) {
    response.json(data);
  });
};



module.exports.login = function(request, response) {

  postgres.retrieveUser(request.body.username, function(data) {
    if (data[0]) {
      bcrypt.compare(request.body.password, data[0].passhash, function(err, res) {
        if (res) {

          //LOGIN SUCCESSFUL

          console.log('Login successful for user: ', request.body.username);
          request.session.login = true;
          request.session.username = request.body.username;

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
/***  CREATION ROUTES    ***/
/***************************/


module.exports.createTopic = function(request, response) {
  //AUTHENTICATION HERE
  if (request.session.login) {

    console.log(request.body);

    //call accepts true or false depending on whether the request failed or not
    postgres.createTopic(request.body.headline, request.body.link,
     request.body.content, request.body.location, function(success) {
      if (success) {

        //PUT MESSAGE IN QUEUE
        connection.then(function(conn) {
          var ok = conn.createChannel();
          ok = ok.then(function(ch) {
            ch.assertQueue(q);
            // Here we are sending the tree:<path>:<filter> command
            var msg = 'Tree:'+request.body.location;
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


module.exports.createGroupTopic = function(request, response) {
  console.log('REQUEST.BODY',request.body);
  //call accepts true or false depending on whether the request failed or not
  postgres.createGroupTopic(request.body.headline, request.body.link, 
    request.body.content, request.body.location, 
    request.body.group, function(success) {
    if (success) {
      response.end('group topic successfully created');
    } else {
      response.end('error inserting into topics');
    }
  });
};

module.exports.createSubgroupTopic = function(request, response) {
  console.log('REQUEST.BODY',request.body);
  postgres.createSubgroupTopic(request.body.headline, request.body.link, 
    request.body.content, request.body.location, request.body.group, 
    request.body.subgroup, function(success) {
    if (success) {
      response.end('subgroup topic successfully created');
    } else {
      response.end('error inserting into topics');
    }
  });
};

module.exports.createGroup = function(request, response) {
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

module.exports.createUser = function(request, response) {

  //NEED TO MAKE SURE THAT THE USER DOES NOT ALREADY EXITS
  //Actually, this is a larger question of how to alert 
  //to the user whether or not his field input is valid

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

}

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





