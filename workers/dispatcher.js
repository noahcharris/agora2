#!/usr/bin/env node
// Post a new task to the work queue

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//MAIN SERVER IS THE TRUE DISPATCHER,
//THIS FILE WILL BE DELETED

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


var amqp = require('amqplib');
var when = require('when');
var connection = amqp.connect('amqp://localhost')
var q = 'tasks';

// amqp.connect('amqp://localhost').then(function(conn) {
//   return when(conn.createChannel().then(function(ch) {
//     var q = 'task_queue';
//     var ok = ch.assertQueue(q, {durable: true});
    
//     return ok.then(function() {
//       var msg = process.argv.slice(2).join(' ') || "Hello World!"
//       ch.sendToQueue(q, new Buffer(msg), {deliveryMode: true});
//       console.log(" [x] Sent '%s'", msg);
//       return ch.close();
//     });
//   })).ensure(function() { conn.close(); });
// }).then(null, console.warn);


connection.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(q);
    ch.sendToQueue(q, new Buffer('1'));
  });
  return ok;
}).then(null, console.warn);

connection.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(q);
    ch.sendToQueue(q, new Buffer('2'));
  });
  return ok;
}).then(null, console.warn);

