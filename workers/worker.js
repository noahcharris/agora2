#!/usr/bin/env node
// Process tasks from the work queue


// Maybe I should just throw this file in the server directory,
// if there is only one file it shouldn't be in its own directory.



//make separate queries to seperate databases (for scaling purposes)

var pg = require('pg');

var conString = 'postgres://noahharris@localhost:5432/noahharris';
//var conString = 'postgres://awsuser:secretly@agoradb.cxod0usrhuqb.us-west-1.rds.amazonaws.com:5432/mydb';

var client = new pg.Client(conString);

client.connect();

var Memcached = require('memcached');

// Have to include port number in the connection string or it won't work
var memcached = new Memcached('127.0.0.1:11211');



var amqp = require('amqplib');

var tb = require('./treebuilder.js');
var vt = require('./voteTalley.js');










//LISTENING TO THE QUEUE

amqp.connect('amqp://localhost').then(function(conn) {
  conn.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertQueue('tasks', {durable: true});
    ok = ok.then(function() { ch.prefetch(1); });
    ok = ok.then(function() {
      ch.consume('tasks', doWork, {noAck: false});
      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
    return ok;

    function doWork(msg) {

      var body = msg.content.toString();

      console.log(" [x] Received '%s'", body);

      console.log('split up ', body.split(':'));

      // memcached.set(body, 'PLACEHOLDER', 10, function (err, result) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log('successfully inserted data');

      //     memcached.get(body, function (err, data) {
      //       console.log('GETTING BACK THE MEMCACHE DATA WE INSERTED', data);
      //     });
      //   }
      // });

      //WOULD USE PATHPARSER HERE

      if (body.split(':')[0] === 'Tree') {
        
        if (body.split(':')[1] === '') {
          tb.buildWorld();
        } else if (body.split(':')[1].split('/').length === 1) { 
          tb.buildCountry(body.split(':')[1]);
        } else if (body.split(':')[1].split('/').length === 2
        && body.split(':')[1].split('/')[1] !== 'United States') {
          tb.buildCity(body.split(':')[1]);
        } else { 
          tb.build(body.split(':')[1]);
        }




        //THIS DOESNT WORK, NEED TO PASS OBJECTS ALONG OR SOMETHING LIKE THAT
        //i'm going to pass along a callback
        ch.ack(msg);
        console.log(' [x] Done');
      } else if (body.split(':')[0] === 'Vote') {
        
        vt.buildProfile(body.split(':')[1]);
        ch.ack(msg);
        console.log(' [x] Done');

      } else if (body.split(':')[0] === 'Feed') {
        //TODO
      } else if (body.split(':')[0] === 'Search') {
        //TODO
      }


    }
  });
}).then(null, console.warn);





