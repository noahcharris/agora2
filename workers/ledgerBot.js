//  _              _                 ____        _   
// | |            | |               |  _ \      | |  
// | |     ___  __| | __ _  ___ _ __| |_) | ___ | |_ 
// | |    / _ \/ _` |/ _` |/ _ \ '__|  _ < / _ \| __|
// | |___|  __/ (_| | (_| |  __/ |  | |_) | (_) | |_ 
// |______\___|\__,_|\__, |\___|_|  |____/ \___/ \__|
//                    __/ |                          
//                   |___/                           

var pg = require('pg');

//var conString = 'postgres://noahharris@localhost:5432/noahharris';
var conString = 'postgres://noahharris:mypassword@agora2db.cfm6lqsulycg.us-west-2.rds.amazonaws.com:5432/thebestdb';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';
var client = new pg.Client(conString);
client.connect();






















function recursiveTopicDelete(topicId) {
  //delete commentvotejoin
  //delete res/rep vote join
  client.query("DELETE FROM topics WHERE id = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });



  client.query("DELETE FROM comments WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM response WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM replies WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });




  client.query("DELETE FROM topicVisitJoin WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM topicVoteJoin WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });



  //HAVE TO DO COMMENT/RESPONSE/REPLY VOTE JOIN S IN ANOTHER FUNCTION FOR NOW...

  client.query("DELETE FROM commentVoteJoin WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM responseVoteJoin WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM replyVoteJoin WHERE topic = "+topicId+";", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });



};























function sweepTopicVisitJoin() {


  client.query("SELECT * FROM topicVisitJoin;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM topics WHERE id = '"+temp[i].topic+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM topicVisitJoin WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });


};







function sweepVoteJoins() {

  //for all comment/res/rep vote join entries,
  //see if the com/res/rep exists, if not, delete the vote join


  client.query("SELECT * FROM topicVoteJoin;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM topics WHERE id = '"+temp[i].topic+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM topicVoteJoin WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });




  client.query("SELECT * FROM commentVoteJoin;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM comments WHERE id = '"+temp[i].comment+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM commentVoteJoin WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });




  client.query("SELECT * FROM responseVoteJoin;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM responses WHERE id = '"+temp[i].response+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM responseVoteJoin WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });




  client.query("SELECT * FROM replyVoteJoin;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM replies WHERE id = '"+temp[i].reply+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM replyVoteJoin WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });



};































function cleanMessageTables() {

  //delete messages without users
  //delete messageChains without users

  client.query("SELECT * FROM messages;", function(err, result) {
    if (err) {
      console.log('error selecting some shit: ', err);
    } else {
      var temp = result.rows;
      for (var i=0; i < temp.length; i++) {


        client.query("SELECT * FROM users WHERE username = '"+temp[i].sender+"' OR username = '"+temp[i].recipient+"';", 
          function(err, result) {
            if (err)
              console.log('error selecting some shit: ', err);

            if (result.rows.length) {
              //all good
            } else {



                client.query("DELETE FROM messages WHERE id = "+temp[i].id+";", function(err, result) {
                  if (err)
                    console.log('error deleting some shit: ', err);
                });




            }
          });



      }
    }
  });



    client.query("SELECT * FROM messageChains;", function(err, result) {
      if (err) {
        console.log('error selecting some shit: ', err);
      } else {
        var temp = result.rows;
        for (var i=0; i < temp.length; i++) {


          client.query("SELECT * FROM users WHERE username = '"+temp[i].username1+"' OR username = '"+temp[i].username2+"';", 
            function(err, result) {
              if (err)
                console.log('error selecting some shit: ', err);

              if (result.rows.length === 2) {
                //all good
              } else {



                  client.query("DELETE FROM messageChains WHERE id = "+temp[i].id+";", function(err, result) {
                    if (err)
                      console.log('error deleting some shit: ', err);
                  });




              }
            });



        }
      }
    });

  };

};











function cleanHeatTables() {


  client.query("DELETE FROM heatPostJoin WHERE postedAt > now() - interval '1 hour';", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM heatVisitJoin WHERE visitedAt > now() - interval '1 hour';", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });
  client.query("DELETE FROM heatVoteJoin WHERE votedAt > now() - interval '1 hour';", function(err, result) {
    if (err)
      console.log('error deleting some shit: ', err);
  });


};








function deleteTopicsByChannel(channel) {

};


function deleteTopicsByLocation(location) {

};















