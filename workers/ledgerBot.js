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
  //delete topic
  //delete comments/res/rep
  //delete topicvisitjoin
  //delete topicvotejoin
  //delete commentvotejoin
  //delete res/rep vote join


};


function cleanMessageTables() {

  //delete messages without users
  //delete messageChains without users

};


function cleanHeatTables() {

//delete old heatvotes
//delete old heatvisits
//delete old heatposts

};

function sweepTopicVisitJoin() {

};

function sweepTopicVoteJoin() {

};


function deleteTopicsByChannel(channel) {

};


function deleteTopicsByLocation(location) {

};















