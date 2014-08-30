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
        console.log('error setting up postGIS');
      } else {
        console.log('postgres successfully updated');
      }
    });
};



module.exports.retrievePointsWithinRadius = function(latitude, longitude, cb) {

    //could work as a temporary solution. still vulnerable i think...
    //if (typeof latitude === 'number' && typeof longitude === '')


var query = client.query("SELECT * FROM groups "
    +"WHERE ST_DWithin(geom, ST_GeomFromText('POINT("+longitude+" "+latitude+")', 4269), 10);", function(err, result) {
    if (err) {
      console.log('failed to retrieve points(spaces) for lat:', latitude, ' and long:', longitude);
    } else {
      cb(result.rows);
    }
  });

};





/**************************/
/***  CREATION METHODS  ***/
/**************************/


module.exports.createTopic = function(headline, link, contents, location, cb) {

  console.log(location.split('/'));

  country = '';

  if (location.split('/').length === 1) {
    country = location
  }


  //NEED TO WRITE SOME KIND OF PATHPARSER THAT I CAN USE IN
  //VARIOUS PLACES AROUND THE APP

  //needs to pass through group and subgroup
  console.log('trying to insert', contents);
  //need to sanitize the sql parameters
  client.query("INSERT INTO topics (headline, link, contents, location, rank, "
    +"country, state, city) "
    +"VALUES ($1, $2, $3, $4, 42, $5, $6, $7);",
    [headline, link, contents, location, country, '', ''], function(err, result) {
      if (err) {
        console.log('error inserting post into topics');
        cb(false);
      } else {
        cb(true);
      }
    });
};


//I do not need three different routes for topics, there must be a better way..


module.exports.createGroupTopic = function(headline, link, contents, location, group, cb) {
  client.query("INSERT INTO topics (headline, link, contents, location, agroup, rank) "
    +"VALUES ($1, $2, $3, $4, $5, "+0+");",
    [headline, link, contents, location, group], function(err, result) {
      if (err) {
        console.log('error inserting post into topics');
        console.log(err);
        cb(false);
      } else {
        cb(true);
      }
    });

};

module.exports.createSubgroupTopic = function(headline, link, contents, location, group, subgroup, cb) {
  client.query("INSERT INTO topics (headline, link, contents, location, agroup, subgroup, rank) "
    +"VALUES ($1, $2, $3, $4, $5, $6, "+0+");",
    [headline, link, contents, location, group, subgroup], function(err, result) {
      if (err) {
        console.log('error inserting post into topics');
        cb(false);
      } else {
        console.log(result);
        cb(true);
      }
    });
};


module.exports.createComment = function(location, group, topic, headline, content, cb) {
  client.query("INSERT INTO comments (location, agroup, topic, headline, contents) "
    +"VALUES ($1, $2, $3, $4, $5);", [location, group, topic, headline, content], function(err, result) {
      if (err) {
        console.log('error inserting into comments');
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
        console.log('error inserting into replies');
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
        console.log('[!!!] error inserting into groups table');
        console.log(err);
        cb(false);
      } else {
        console.log('successfully created group: ', name);
        cb(true);
      }
  });
};

module.exports.createUser = function(username, passhash, salt, origin, cb) {
  client.query("INSERT INTO users (username, passhash, salt, origin) "
    +"VALUES ($1, $2, $3, $4);", [username, passhash, salt, origin], function(err, result) {
      if (err) {
        console.log('error inserting into users table');
        console.log(err);
        cb(false);
      } else {
        console.log('successfully created user: ', username);
        cb(true);
      }
    });
};











/***************************/
/***  RETRIEVAL METHODS  ***/
/***************************/


module.exports.retrieveTopics = function(location, cb) {

  client.query("SELECT * FROM topics WHERE location = $1;",[location], function(err, result) {
    if (err) {
      console.log('failed to retrieve topics for '+ location);
    }
     if (result) {
      //console.log('retrieved topics for '+city+':', result.rows);
      cb(result.rows);
     }
  });
};

module.exports.retrieveGroupTopics = function(location, group, cb) {
  client.query("SELECT * FROM topics WHERE location=$1 "
    +"AND agroup=$2;", [location, group], function(err, result) {
      if (err) {
        console.log('error retrieving group topics from database');
      } else {
        cb(result.rows);
      }
    });
};

module.exports.retrieveSubgroupTopics = function(location, group, name, cb) {
  //TODO
  client.query("SELECT * FROM topics WHERE location=$1 AND "
    +"agroup=$2 AND subgroup=$3;", [location, group, name], function(err, result) {
      if (err) {
        console.log('error retrieving retrieving subgroup topics from database');
      } else {
        cb(result.rows);
      }
    });

};

module.exports.retrieveGroups = function(location, cb) {
  client.query("SELECT * FROM groups WHERE location=$1;", [location], function(err, result) {
    if (err) {
      console.log('error retrieving from groups');
    } else {
      cb(result.rows);
    }
  });
};

module.exports.retrieveSubgroups = function(location, group, cb) {
  client.query("SELECT * FROM subgroups WHERE "
    +"location=$1 AND agroup=$2;", [location, group], function(err, result) {
      if (err) {
        console.log('error selecting from subgroups');
      } else {
        cb(result.rows);
      }
    });
};

module.exports.retrievePlace = function(location, cb) {
  client.query("SELECT * FROM places WHERE location=$1;", [location], function(err, result) {
      if (err) {
        console.log(err);
        console.log('error selecting from places');
      } else {
        cb(result.rows);
      }
  });
};

module.exports.retrieveUser = function(username, cb) {
  client.query("SELECT * FROM users "
    +"WHERE username=$1", [username], function(err, result) {
      if (err) {
        console.log(err);
        console.log('error selecting from users');
      } else {
        cb(result.rows);
      }
    });
};




//for checking existence of group
module.exports.getGroupForPath = function(location, group, cb) {
  console.log('querying for group, location:', location, ' group:', group);
  client.query("SELECT * FROM groups WHERE "
    +"location=$1 AND name=$2;", [location, group], function(err, result) {
      if (err) {
        console.log('error selecting group for path');
      } else {
        cb(result.rows);
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

  client.query("CREATE TABLE bookmarks ( "
    +"id         SERIAL PRIMARY KEY,"
    +"username   VARCHAR(50),"
    +"name       VARCHAR(50),"
    +"url        VARCHAR(200));", function(err, result) {
    if (err) {
      console.log('failed to create bookmarks table');
    } else {
      console.log('bookmarks table created');
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

  client.query("CREATE TABLE groups ("
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

  client.query("CREATE TABLE subgroups ("
    +"id             SERIAL PRIMARY KEY,"
    +"name           VARCHAR(50),"
    +"description    TEXT,"
    +"creator        VARCHAR(50),"
    +"size           INTEGER,"
    +"open           BOOLEAN,"
    +"location       VARCHAR(100),"
    +"country        VARCHAR(50),"
    +"state          VARCHAR(50),"
    +"city           VARCHAR(50),"
    //have to use this bullshit variable because group is a keyword
    +"agroup         VARCHAR(100),"
    +"rank           INTEGER);", function(err, result) {
      if (err) {
        console.log('failed to create subgroups table');
        console.log(result);
      } else {
        console.log('subgroups table created');
      }
  });


  client.query("CREATE TABLE places ("
    +"id            SERIAL PRIMARY KEY,"
    +"location      VARCHAR(100),"
    +"country       VARCHAR(50),"
    +"state         VARCHAR(50),"
    +"city          VARCHAR(50),"
    +"name          VARCHAR(50),"
    +"description   TEXT,"
    +"population    INTEGER,"
    +"latitude      DECIMAL(25, 10),"
    +"longitude     DECIMAL(25, 10));", function(err, result) {
    if (err) {
      console.log('failed to create places table');
      console.log(result);
    } else {
      console.log('places table created');
    }
  });

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

// module.exports.populateGroups = function() {
//   client.query("INSERT INTO groups "
//     +"(geom, name, description, size, rank, public,"
//     +"open, latitude, longitude, location) "
//     //inserting using postGIS function
//     //postGIS order is longitude, latitude!!
//     +"VALUES (ST_PointFromText('POINT(2.330 48.864)', 4269), 'Silhouette',"
//     +"'Amidst the catacombs.', 311, 4072, true, true, 48.864, 2.330, 'France/Paris');", function(err, result) {
//       if (err) {
//         console.log('error inserting into groups table');
//       } else {
//         console.log('successfully inserted mock points data');
//       }
//   });
// };

// module.exports.populateSubgroups = function() {
//   client.query("INSERT INTO subgroups "
//     +"(name, agroup, description, size, rank, "
//     +"open, location) "
//     //inserting using postGIS function
//     //postGIS order is longitude, latitude!!
//     +"VALUES ('Echo 9', 'Silhouette',"
//     +"'Amidst the catacombs.', 27, 56, true, 'France/Paris');", function(err, result) {
//       if (err) {
//         console.log('error inserting into subgroups table');
//       } else {
//         console.log('successfully inserted subgroup data');
//       }
//   });
// };


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



