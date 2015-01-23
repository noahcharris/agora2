  
var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');

var mailer = require('nodemailer');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var timeEventLoop = require('time-eventloop');

timeEventLoop.start(/* { options } */);

require('crashreporter').configure({
    outDir: '/home/ec2-user/crashes',
    mailEnabled: true,
    mailTransportName: 'SMTP',
    mailTransportConfig: {
        service: 'Gmail',
        auth: {
            user: 'agora.reporter@gmail.com',
            pass: 'fieldsoffallensoldiers'
        }
    },
    mailSubject: 'advanced.js crashreporter test',
    mailFrom: 'crashreporter <agora.reporter@gmail.com>',
    mailTo: 'noah.christopher.harris@gmail.com'
});

var routes = require('./workerRoutes.js');

app = express();



app.use(bodyParser());
app.use(cookieParser());



app.use(bodyParser());


app.use(function(request, response, next) {

  console.log('serving user client at ip '+request.ip);
  next();
});


app.use(function(request, response, next) {

  response.setHeader('Access-Control-Allow-Origin', 'http://liveworld.io');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  next();

});



app.get('/resizeImage', routes.resizeImage);

app.post('/addToTreeCache', routes.addTree);
app.post('/removeFromTreeCache', routes.removeTree);










app.use(express.static(__dirname + '/../client'));

var options = {
  key: fs.readFileSync(__dirname + '/agoraSSL.key'),
  cert: fs.readFileSync(__dirname + '/agoraSSL.crt'),
};

//this is messing with the cookies somehow
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('express server listening on ports 80 and 443');  
