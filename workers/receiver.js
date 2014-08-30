var amqp = require('amqplib');
var Memcached = require('memcached');

// Have to include port number in the connection string or it won't work
var memcached = new Memcached('127.0.0.1:11211');



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

      //#############################################

      //carry out task, write to postgres, build trees
      //and put them in memcache, etc..

      //#############################################


      var body = msg.content.toString();

      memcached.set(body, 'PLACEHOLDER', 10, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log('successfully inserted data');

          memcached.get(body, function (err, data) {
            console.log('GETTING BACK THE MEMCACHE DATA WE INSERTED', data);
          });
        }
      });




      console.log(" [x] Received '%s'", body);
      var secs = body.split('.').length - 1;
      //console.log(" [x] Task takes %d seconds", secs);
      setTimeout(function() {
        console.log(" [x] Done");
        ch.ack(msg);
      }, secs * 1000);
    }
  });
}).then(null, console.warn);
