var pg = require('pg');

//var conString = 'postgres://noahharris@localhost:5432/noahharris';
var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';
var client = new pg.Client(conString);
client.connect();


var test = 82;

var cacheArray = []





for (var i=0; i < cacheArray.length ;i++) {



  //loop through cacheArray, build trees for every




}






//how should 
client.query("SELECT * FROM topics WHERE heat > 50 OR rank > 100 OR id=$1 ORDER BY RANK DESC;",
  [test],
  function(err, result) {
    if (err) {
      console.log('error selecting from topics:', err);
    } else {
      var temp = result.rows;

      for (var i=0; i < temp.length ;i++) {
        //BUILD SOME TREES!!!!!




        



        (function() {



            //woooo treebuilder 2.0

            var id = temp[i].id;

            var count = 0;
            var topic = null;
            var comments = [];
            var responses = [];
            var replies = [];

            var length = temp.length;
            var counter = i;

            client.query("SELECT * FROM topics WHERE topics.id=$1",[temp[i].id], function(err, result) {
              if (err) {
                console.log('error selecting from topics: ', err);
                response.end('error');
              } else {
                count++;
                topic = result.rows[0];
                var flag = (counter === length - 1)
                if (count === 4) {
                  cacheTree(buildSequence(topic, comments, responses, replies), id, flag);
                }
              }

            });

            client.query("SELECT * FROM comments WHERE comments.topic=$1 ORDER BY rank ASC",[temp[i].id], function(err, result) {
              if (err) {
                console.log('error selecting from topics: ', err);
                response.end('error');
              } else {
                count++;
                comments = result.rows;
                var flag = (counter === length - 1)
                if (count === 4) {
                  cacheTree(buildSequence(topic, comments, responses, replies), id, flag);
                }
              }
            });

            client.query("SELECT * FROM responses WHERE responses.topic=$1 ORDER BY rank ASC",[temp[i].id], function(err, result) {
              if (err) {
                console.log('error selecting from topics: ', err);
                response.end('error');
              } else {
                count++;
                responses = result.rows;
                var flag = (counter === length - 1)
                if (count === 4) {
                  cacheTree(buildSequence(topic, comments, responses, replies), id, flag);
                }
              }
            });

            client.query("SELECT * FROM replies WHERE replies.topic=$1 ORDER BY rank ASC",[temp[i].id], function(err, result) {
              if (err) {
                console.log('error selecting from topics: ', err);
                response.end('error');
              } else {
                count++;
                replies = result.rows;
                var flag = (counter === length - 1)
                if (count === 4) {
                  cacheTree(buildSequence(topic, comments, responses, replies), id, flag);
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



        })();







      }//end results for loop

    }
});//end topics select






function cacheTree(obj, topicId, isLast) {

  client.query("SELECT * FROM topicTreeCache WHERE topicId = $1;",
    [topicId], function(err, result) {
      if (err)
        console.log('err checking tree cache: ', err);

      if (result.rows.length) {
        //update cache


        client.query("UPDATE topicTreeCache SET (tree, createdAt) = "
          +"($1, now()) WHERE topicId = $2;",
          [JSON.stringify(obj), topicId],
          function(err, result) {
            if (err) {
              console.log('error updating topic tree cache: ', err);
            } else {
              console.log('successfully cached topic');
              if (isLast)
                console.log('finished');
            }
          });

      } else {
        //create new entry


        client.query("INSERT INTO topicTreeCache (topicId, tree, createdAt) "
          +"VALUES ($1, $2, now());", [topicId, JSON.stringify(obj)],
          function(err, result) {
            if (err) { 
              console.log('error caching tree: ', err);
            } else {
              console.log('successfully cached topic ');
              if (isLast)
                console.log('finished');
            }
        });



      }
  });// end tree cache check


};













