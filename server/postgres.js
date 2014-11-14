var pg = require('pg');

var conString = 'postgres://noahharris@localhost:5432/noahharris';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';

var client = new pg.Client(conString);

client.connect();

//FOR PINGING SERVER:
// client.connect(function(err) {
//   if(err) {
//     return console.error('could not connect to postgres', err);
//   }
//   client.query('SELECT NOW() AS "theTime"', function(err, result) {
//     if(err) {
//       return console.error('error running query', err);
//     }
//     console.log(result.rows[0].theTime);
//     //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
//     client.end();
//   });
// });




module.exports.setupPostGIS = function() {
  client.query("CREATE EXTENSION postgis;"
    +"CREATE EXTENSION postgis_topology;"
    +"CREATE EXTENSION fuzzystrmatch;"
    +"CREATE EXTENSION postgis_tiger_geocoder;", function(err, result) {
      if (err) {
        console.log('error setting up postGIS: ', err);
      } else {
        console.log('postgres successfully updated to support postGIS');
      }
    });
};



module.exports.retrievePointsWithinRadius = function(latitude, longitude, cb) {

    //could work as a temporary solution. still vulnerable i think...
    //if (typeof latitude === 'number' && typeof longitude === '')


  var query = client.query("SELECT * FROM groups "
      +"WHERE ST_DWithin(geom, ST_GeomFromText('POINT("+longitude+" "+latitude+")', 4269), 10);", function(err, result) {
      if (err) {
        console.log('error retrieving points: ', err);
      } else {
        cb(result.rows);
      }
    });

};









/***************************/
/***  RETRIEVAL METHODS  ***/
/***************************/


//new topic retrieval methods with filters

module.exports.retrieveTopTopics = function() {

};

module.exports.retrieveNewTopics = function() {

};

module.exports.retrieveHotTopics = function() {

};



module.exports.retrieveTopics = function(location, cb) {

  client.query("SELECT * FROM topics WHERE location = $1;",[location], function(err, result) {
    if (err) {
      console.log('error retrieving topics: ', err);
    }
     if (result) {
      //console.log('retrieved topics for '+city+':', result.rows);
      cb(result.rows);
     }
  });
};


module.exports.retrievePlace = function(location, cb) {
  client.query("SELECT * FROM places WHERE location=$1;", [location], function(err, result) {
      if (err) {
        console.log('error selecting from places: ', err);
      } else {
        cb(result.rows);
      }
  });
};

module.exports.retrieveUser = function(username, cb) {
  client.query("SELECT * FROM users "
    +"WHERE username=$1", [username], function(err, result) {
      if (err) {
        console.log('error selecting from users: ', err);
      } else {
        cb(result.rows);
      }
    });
};




/**************************/
/***  CREATION METHODS  ***/
/**************************/


module.exports.createTopic = function(headline, link, contents, location, channel, rank, cb) {

  console.log(location.split('/'));

  country = '';

  if (location.split('/').length === 1) {
    country = location
  }

  //need to sanitize the sql parameters
  client.query("INSERT INTO topics (headline, link, contents, location, channel, rank)"
    +"VALUES ($1, $2, $3, $4, $5, $6);",
    [headline, link, contents, location, channel, rank], function(err, result) {
      if (err) {
        console.log('error inserting post into topics: ', err);
        cb(false);
      } else {
        cb(true);
      }
    });
};




module.exports.createComment = function(location, group, topic, headline, content, cb) {
  client.query("INSERT INTO comments (location, agroup, topic, headline, contents) "
    +"VALUES ($1, $2, $3, $4, $5);", [location, group, topic, headline, content], function(err, result) {
      if (err) {
        console.log('error inserting into comments: ', err);
        cb(false);
      } else {
        console.log(result);
        cb(true);
      }
    });
};


module.exports.createReply = function(location, group, topic, comment, headline, content, cb) {
  client.query("INSERT INTO replies (location, agroup, topic, comment, headline, contents) "
    +"VALUES ($1, $2, $3, $4, $5, $6);", [location, group, topic, comment, headline, content], function(err, result) {
      if (err) {
        console.log('error inserting into replies: ', err);
        cb(false);
      } else {
        console.log(result);
        cb(true);
      }
    });
};

module.exports.createGroup = function(location, lat, lng, name, description, creator, public, open, cb) {
  console.log('creating group!');
  client.query("INSERT INTO groups "
    +"(geom, name, description, creator, size, rank, public,"
    +"open, latitude, longitude, location) "
    //inserting using postGIS function
    //postGIS order is longitude, latitude!!
    +"VALUES (ST_PointFromText('POINT("+lng+" "+lat+")', 4269), $1,"
    +"$2, 311, 4072, $3, $4, $5, $6, $7, $8);",
    [name, description, creator, public, open, lat, lng, location], function(err, result) {
      if (err) {
        console.log('[!!!] error inserting into groups table: ', err);
        console.log(err);
        cb(false);
      } else {
        console.log('successfully created group: ', name);
        cb(true);
      }
  });
};

module.exports.createUser = function(username, passhash, salt, location, cb) {
  client.query("INSERT INTO users (username, passhash, salt, location) "
    +"VALUES ($1, $2, $3, $4);", [username, passhash, salt, location], function(err, result) {
      if (err) {
        console.log('error inserting into users table: ', err);
        console.log(err);
        cb(false);
      } else {
        console.log('successfully created user: ', username);
        cb(true);
      }
    });
};






module.exports.createTables = function() {

  //NEED TO ADD TIMESTAMPS TO ALL THESE (need to research postgres+time)

  console.log('creating tables');

  client.query("CREATE TABLE users ("
    +"id         SERIAL PRIMARY KEY,"
    +"username   VARCHAR(50),"
    +"passhash   VARCHAR(100),"
    +"salt       VARCHAR(50),"
    +"country    VARCHAR(50),"
    +"state      VARCHAR(50),"
    +"city       VARCHAR(50),"
    +"origin     VARCHAR(50));", function(err, result) {
      if (err) {
        console.log('failed to create users table');
        console.log(result);
      } else {
        console.log('users table created');
      }
  });
  client.query("CREATE TABLE votes ( "
    +"id         SERIAL PRIMARY KEY,"
    +"username   VARCHAR(50),"
    +"topic      INTEGER,"
    +"comment    INTEGER,"
    +"reply      INTEGER);", function(err, result) {
      if (err) {
        console.log('failed to create votes table');
        console.log(result);
      } else {
        console.log('votes table created');
      }
  });


  client.query("CREATE TABLE topics ("
    +"id         SERIAL PRIMARY KEY,"
    +"headline   VARCHAR(100),"
    +"link       VARCHAR(100),"
    +"poster     VARCHAR(50),"
    +"contents   VARCHAR(300),"
    +"imageurl   VARCHAR(100),"
    +"location   VARCHAR(100),"
    +"channel    VARCHAR(50),"
    +"country    VARCHAR(50),"
    +"state      VARCHAR(50),"
    +"city       VARCHAR(50),"
    +"posterLat  DECIMAL(25, 10),"
    +"posterLong DECIMAL(25, 10),"
    //have to use this bullshit variable because group is a keyword
    +"agroup     VARCHAR(100),"
    +"subgroup   VARCHAR(50),"
    +"rank       INTEGER,"
    +"heat       INTEGER);", function(err, result) {
      if (err) {
        console.log('failed to create topics table');
        console.log(result);
      } else {
        console.log('topics table created');
      }
  });
  client.query("CREATE TABLE comments ("
    +"id         SERIAL PRIMARY KEY,"
    +"location   VARCHAR(100),"
    +"country    VARCHAR(50),"
    +"state      VARCHAR(50),"
    +"city       VARCHAR(50),"
    +"posterLat  DECIMAL(25, 10),"
    +"posterLong DECIMAL(25, 10),"
    +"agroup     VARCHAR(100),"
    +"topic      INTEGER,"  //foreign key
    +"headline   VARCHAR(100),"
    +"contents   VARCHAR(300),"
    +"poster     VARCHAR(50),"
    +"rank       INTEGER);", function(err, result) {
      if (err) {
        console.log('failed to create comments table');
        console.log(result);
      } else {
        console.log('comments table created');
      }
  });
  client.query("CREATE TABLE replies ("
    +"id         SERIAL PRIMARY KEY,"
    +"location   VARCHAR(100),"
    +"country    VARCHAR(50),"
    +"state      VARCHAR(50),"
    +"city       VARCHAR(50),"
    +"posterLat  DECIMAL(25, 10),"
    +"posterLong DECIMAL(25, 10),"
    +"agroup     VARCHAR(100),"
    +"topic      INTEGER,"  //foreign key
    +"comment    INTEGER,"  //foreign key
    +"headline   VARCHAR(100),"
    +"contents   VARCHAR(300),"
    +"poster     VARCHAR(50),"
    +"rank       INTEGER);", function(err, result) {
      if (err) {
        console.log('failed to create replies table');
        console.log(result);
      } else {
        console.log('replies table created');
      }
  });

  client.query("CREATE TABLE places ("
    +"id            SERIAL PRIMARY KEY,"
    +"name          VARCHAR(50),"
    +"description   TEXT,"
    +"creator       VARCHAR(50),"
    +"size          INTEGER,"
    +"rank          INTEGER,"
    +"public        BOOLEAN,"
    +"open          BOOLEAN,"
    +"latitude      DECIMAL(25, 10),"
    +"longitude     DECIMAL(25, 10),"
    +"geom          GEOMETRY(Point, 4269),"
    +"location      VARCHAR(100),"
    +"channel       VARCHAR(50),"
    +"country       VARCHAR(50),"
    +"state         VARCHAR(50),"
    +"city          VARCHAR(50));", function(err, result) {
    if (err) {
      console.log('failed to create groups table');
      console.log(result);
    } else {
      console.log('groups table created');
      //create spatial index
      client.query("CREATE INDEX groups_gix "
        +"ON groups "
        +"USING GIST (geom);", function() {
          if (err)  {
            console.log('error creating spatial index on groups');
          } else {
            console.log('spatial index on spaces successfully created');
          }
      });
    }
  });

  // client.query("CREATE TABLE places ("
  //   +"id            SERIAL PRIMARY KEY,"
  //   +"location      VARCHAR(100),"
  //   +"country       VARCHAR(50),"
  //   +"state         VARCHAR(50),"
  //   +"city          VARCHAR(50),"
  //   +"name          VARCHAR(50),"
  //   +"description   TEXT,"
  //   +"population    INTEGER,"
  //   +"latitude      DECIMAL(25, 10),"
  //   +"longitude     DECIMAL(25, 10));", function(err, result) {
  //   if (err) {
  //     console.log('failed to create places table');
  //     console.log(result);
  //   } else {
  //     console.log('places table created');
  //   }
  // });

  client.query("CREATE TABLE messages ("
    +"id         SERIAL PRIMARY KEY,"
    +"contents   TEXT,"
    +"sender     VARCHAR(50),"
    +"senderLat  DECIMAL(25, 10),"
    +"senderLong DECIMAL(25, 10),"
    +"recipient  VARCHAR(50));", function(err, result) {
      if (err) {
        console.log('failed to create messages table');
        console.log(result);
      } else {
        console.log('messages table created');
      }
  });

};



// module.exports.populatePlaces = function() {
//   client.query("INSERT INTO places "
//     +"(location, name, description, population) "
//     +"VALUES ('', 'World', 'Our Home', 10);", function(err, result) {
//       if (err) {
//         console.log('failed to insert into places');
//         console.log(err);
//       } else {
//         console.log('successfully inserted into places');
//       }
//   });
// }



// module.exports.populateTopics = function() {
//   console.log('populating users table');
//   client.query("INSERT INTO topics "
//     +"(headline, poster, contents, location, agroup, subgroup, rank) "
//     +"VALUES ('Great great great!', 'occupy', 'whatchu gon do',"
//     +" 'France/Paris', 'Silhouette', 'Echo 9', 42);", function(err, result) {
//       if (err) {
//         console.log('failed to insert mock topic values');
//         console.log(result);
//       } else {
//         console.log('successfully inserted mock topics');
//       }
//   });
// };

console.log('postgres functions loaded');



