

var pg = require('pg');

var conString = 'postgres://noahharris@localhost:5432/noahharris';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';

var client = new pg.Client(conString);

client.connect();

var Memcached = require('memcached');

// Have to include port number in the connection string or it won't work
var memcached = new Memcached('127.0.0.1:11211');



var amqp = require('amqplib');

















module.exports.build = function(path, cb) {

  console.log('executing treeBuilder');

  var count = 0;
  var topics, comments, replies;

  //limit these by ranking??

  //TOPICS
  client.query("SELECT * FROM topics WHERE topics.location=$1;",[path], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        topics = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, path, cb);
        }
      }
  });

  //COMMENTS
  client.query("SELECT comments.* FROM comments "
    +"INNER JOIN topics ON comments.topic=topics.id WHERE topics.location=$1;",[path], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        comments = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, path, cb);
        }
      }
  });

  //REPLIES
  client.query("SELECT replies.* FROM replies "
    +"INNER JOIN topics ON replies.topic=topics.id WHERE topics.location=$1;",[path], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nREPLIES');
        // console.log(result.rows);
        replies = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, path, cb);
        }
      }
  });
 
};



















module.exports.buildWorld = function(channel) {


  console.log('executing treeBuilder (BUILDING WORLD)');

  var count = 0;
  var topics, comments, replies;

  //limit these by ranking??


  //something tells me that this is not going to work as we scale...


  //TOPICS
  client.query("SELECT * FROM topics;", function(err, result) {
      if (err) {
        console.log('error selecting topics');
        console.log(err);
      } else {
        //console.log('\nTOPICS');
        //console.log(result.rows);
        topics = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, '', channel);
        }
      }
  });

  //COMMENTS
  client.query("SELECT * FROM comments;", function(err, result) {
      if (err) {
        console.log('error selecting comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        comments = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, '', channel);
        }
      }
  });

  //REPLIES
  client.query("SELECT * FROM replies;", function(err, result) {
      if (err) {
        console.log('error selecting replies');
        console.log(err);
      } else {
        // console.log('\nREPLIES');
        // console.log(result.rows);
        replies = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, '', channel);
        }
      }
  });
};






















module.exports.buildCountry = function(country) {

  console.log('executing build sequence');
  //console.log('executing treeBuilder for country: ', country);

  var count = 0;
  var topics, comments, replies;


  //TOPICS
  client.query("SELECT * FROM topics WHERE topics.country=$1;",[country], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        topics = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, country, cb);
        }
      }
  });

  //COMMENTS
  client.query("SELECT comments.* FROM comments "
    +"INNER JOIN topics ON comments.topic=topics.id WHERE topics.country=$1;",[country], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nCOMMENTS');
        // console.log(result.rows);
        comments = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, country, cb);
        }
      }
  });

  //REPLIES
  client.query("SELECT replies.* FROM replies "
    +"INNER JOIN topics ON replies.topic=topics.id WHERE topics.country=$1;",[country], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nREPLIES');
        // console.log(result.rows);
        replies = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, country);
        }
      }
  });
};






















module.exports.buildCity = function(city) {

  console.log('executing build sequence');
  //console.log('executing treeBuilder for city: ', country);

  var count = 0;
  var topics, comments, replies;


  //TOPICS
  client.query("SELECT * FROM topics WHERE topics.city=$1;",[city], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        topics = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, city, cb);
        }
      }
  });

  //COMMENTS
  client.query("SELECT comments.* FROM comments "
    +"INNER JOIN topics ON comments.topic=topics.id WHERE topics.city=$1;",[city], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nCOMMENTS');
        // console.log(result.rows);
        comments = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, city, cb);
        }
      }
  });

  //REPLIES
  client.query("SELECT replies.* FROM replies "
    +"INNER JOIN topics ON replies.topic=topics.id WHERE topics.city=$1;",[city], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nREPLIES');
        // console.log(result.rows);
        replies = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, city);
        }
      }
  });
};




















module.exports.buildState = function(state) {

  console.log('executing build sequence');
  //console.log('executing treeBuilder for state: ', state);

  var count = 0;
  var topics, comments, replies;


  //TOPICS
  client.query("SELECT * FROM topics WHERE topics.state=$1;",[state], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nTOPICS');
        // console.log(result.rows);
        topics = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, state, cb);
        }
      }
  });

  //COMMENTS
  client.query("SELECT comments.* FROM comments "
    +"INNER JOIN topics ON comments.topic=topics.id WHERE topics.state=$1;",[state], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nCOMMENTS');
        // console.log(result.rows);
        comments = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, state, cb);
        }
      }
  });

  //REPLIES
  client.query("SELECT replies.* FROM replies "
    +"INNER JOIN topics ON replies.topic=topics.id WHERE topics.state=$1;",[state], function(err, result) {
      if (err) {
        console.log('error join selecting topics and comments');
        console.log(err);
      } else {
        // console.log('\nREPLIES');
        // console.log(result.rows);
        replies = result.rows;
        count++;
        if (count === 3) {
          buildSequence(topics, comments, replies, state);
        }
      }
  });
};



















buildSequence = function(topics, comments, replies, path, channel) {

  console.log('executing build sequence');

  //Step 1, Build the SortedLinkedList representation of the tree
  var resultLinkedList = new SortedLinkedList();

  for (var i=0;i<topics.length;i++) {
    //console.log('inserting topic with id: ', topics[i].id);
    resultLinkedList.insert(topics[i]);
  }

  for (var i=0;i<comments.length;i++) {
    //have to pass in head to searchRecurse right now, not very clean
    var topic = resultLinkedList.searchRecurse(resultLinkedList._head, comments[i].topic);
    if (topic && !topic.comments) {
      topic.comments = new SortedLinkedList();
      console.log('created new linked list for holding comments');
    }
    //when does this become a problem though?
    if (topic) {
      topic.comments.insert(comments[i]);
    }
  }

  for (var i=0;i<replies.length;i++) {
    //have to pass in head to searchRecurse right now, not very clean
    var topic = resultLinkedList.searchRecurse(resultLinkedList._head, replies[i].topic);
    if (topic) {
      var comment = topic.comments.searchRecurse(topic.comments._head, replies[i].comment);
    }
    if (comment && !comment.replies) {
      comment.replies = new SortedLinkedList();
    }
    //when does this become a problem though??
    if (comment) {
      comment.replies.insert(replies[i]);
    }
  }


  //Step 2, Build the JSON representation of the tree

  var result = [];

  function buildTopicsRecurse(node, topicsResult) {
    if (!node) {
      return;
    } else {
      var commentsResult = [];
      if (node.item.comments) {
        buildCommentsRecurse(node.item.comments._head, commentsResult);
      }
      node.item.comments = commentsResult;
      topicsResult.push(node.item);
      buildTopicsRecurse(node.next, topicsResult);
    }
  };


  function buildCommentsRecurse(node, commentsResult) {
    if (!node) {
      return;
    } else {
      var repliesResult = [];
      if (node.item.replies) {
        buildRepliesRecurse(node.item.replies._head, repliesResult);
      }
      node.item.replies = repliesResult;
      commentsResult.push(node.item);
      buildCommentsRecurse(node.next, commentsResult);
    }
  };


  function buildRepliesRecurse(node, repliesResult) {
    if (!node) {
      return;
    } else {
      repliesResult.push(node.item);
      buildRepliesRecurse(node.next, repliesResult);
    }
  };

  buildTopicsRecurse(resultLinkedList._head, result);

  console.log('RESULT JSON: ', result);

  //Step 3, Store JSON in memcached

  //have to have an exception for world because of my foolish naming
  if (path === '')
    path = 'World';

  var keyString = path+'~'+channel+'~TopTopics';
  memcached.set(keyString, result, 1000, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('successfully inserted data into: ', keyString);
    }
  });




};








SortedLinkedList = function() {
  this._head = null;
  this._tail = null;
};
SortedLinkedList.prototype = {
  insert: function(input) {
    if (this._head === null) {
      this._head = this._tail = this.makeNode(input);
    } else {
      if (input.rank > this._head.item.rank) {
        var temp = this._head;
        this._head = this.makeNode(input);
        this._head.next = temp;
      } else {
        this.sortInsert(this._head, input);
      }
    }
  },
  sortInsert: function(node, input) {
    if (node === this._tail) {
      this._tail.next = this.makeNode(input);
      this._tail = this._tail.next;
      return;
    } else {
      if (input.rank > node.next.item.rank) {
        var temp2 = node.next;
        node.next = this.makeNode(input);
        node.next.next = temp2;
        return;
      } else {
        this.sortInsert(node.next, input);
      }
    }
  },
  makeNode: function(item) {
    var node = {};
    node.item = item;
    node.next = null;
  
    return node;
  },
  //give an id and it will search through the SortedLinkedList to find the object
  searchRecurse: function(node, id) {
    if (!node) {
      return null;
    } else if (node.item.id === id) {
      return node.item;
    } else {
      return this.searchRecurse(node.next, id);
    }
  }
};
SortedLinkedList.prototype.constructor = SortedLinkedList;

console.log('treebuilder components loaded')


