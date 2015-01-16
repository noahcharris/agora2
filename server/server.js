  
var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');

var mailer = require('nodemailer');
var cookie = require('cookie');

var session = require('express-session');

var bodyParser = require('body-parser');

var clientSessions = require('client-sessions');

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var ConnectRedisSessions = require( "connect-redis-sessions" );

var csrf = require('csurf');

//use serve-favicon instead!!!
var favicon = require('static-favicon');

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

var routes = require('./routes.js');

app = express();

  

// app.use(function(request, response, next) {   //middleware is cool
//   console.log('received '+request.method+' request at '+request.url);
//   next();
// });

app.use(bodyParser());
app.use(cookieParser());

app.use( ConnectRedisSessions({ 
  app: 'agora',
  port: 6379,
  host: '54.149.165.147',
  cookie: {
    maxAge: 10000,
    path: '/',
    httpOnly: true
  },
  trustProxy: true
}) );



app.use(function(request, response, next) {

  console.log('serving user client at ip '+request.ip);
  next();
});


app.use(function(request, response, next) {

  response.setHeader('Access-Control-Allow-Origin', 'http://liveworld.io');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  next();

});




//app.use(cookieParser());
// app.use(cookieSession({
//   secret: 'Keyboard Cat',
//   secure: true,
//   httpOnly: true,
//   keys: ['a', 'b']
// }));


// console.log(cookie.serialize('foo','bar', {
//   path: '/',
//   secure: true,
//   httpOnly: true,
//   maxAge: 300000
// }));


//got this error: "client-sessions error: Error: you cannot have a secure cookie unless the socket is  secure or you declare req.connection.proxySecure to be true. "

  // app.use(clientSessions({
  //   cookieName: 'mySession', // cookie name dictates the key name added to the request object
  //   secret: 'blargadeeblargblarg', // should be a large unguessable string
  //   duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  //   activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  //   cookie: {
  //       path: '/', // cookie will only be sent to requests under '/api'
  //       maxAge: 600000, // duration of the cookie in milliseconds, defaults to duration above
  //       ephemeral: false, // when true, cookie expires when the browser closes
  //       httpOnly: true, // when true, cookie is not accessible from javascript
  //       secure: true // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
  //     }
  // }));




//EXPRESS-SESSION THIS SHIT DID NOT SEEM TO WORK
// app.set('trust proxy', 1); // trust first proxy

//  app.use(session({
//   secret: 'keyboard cat',
//   cookie: { path: '/', httpOnly: true, secure: true, maxAge: 6000 },
//   //adding these two made some warnings go away so w2snare
//    resave: true,
//    saveUninitialized: true
// }));




//CSRF IS BLOCKING MY AJAX CALLS
//app.use(csrf());

//this is nice for viewing errors!
// process.on('uncaughtException', function (err) {
//     console.log(err);
// }); 


//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

app.get('/', function(request, response) {
  response.redirect('index.html');
});

app.get('/test', routes.test);

//Returns collections of topics to be displayed in sidebar (without trees)
app.get('/topics-top-day', routes.getTopTopicsDay);
app.get('/topics-top-week', routes.getTopTopicsWeek);
app.get('/topics-top-month', routes.getTopTopicsMonth);
app.get('/topics-top-year', routes.getTopTopicsYear);
app.get('/topics-top-time', routes.getTopTopicsTime);

app.get('/topics-new', routes.getNewTopics);
app.get('/topics-hot', routes.getHotTopics);

//INDIVIDUAL TOPICS
app.get('/topicTree', routes.getTopicTree);
app.get('/topicLocations', routes.getTopicLocations);

app.get('/topicSearch', routes.topicSearch);
app.get('/userSearch', routes.userSearch);

app.get('/locationSearch', routes.locationSearch);
app.get('/channelSearch', routes.channelSearch);

//SEE IF THE 'LIKE' PATTERN MATCHING WILL WORK HERE:
app.get('/locationSubtree', routes.getLocationSubtree);
app.get('/channelSubtree', routes.getChannelSubtree);

//users should only be able to have like 150 contacts or smthn before they have to pay
//SECURE
app.get('/contacts', routes.getContacts);
app.get('/messages', routes.getMessageChains);
app.get('/messageChain', routes.getMessageChain);

//USER-CREATED POINTS
app.get('/placePoints', routes.getPoints);
app.get('/placeLatLng', routes.getPlaceLatLng);

//HEAT POINTS (returns countries/states as well)
app.get('/heatPoints', routes.getHeatPoints);

//location profiles and user profiles and channel profiles
app.get('/user', routes.getUser);
app.get('/recentlyPosted', routes.getRecentlyPostedTopics);

app.get('/location', routes.getLocation);
app.get('/channel', routes.getChannel);

//SECURE
app.get('/notifications', routes.getNotifications);


//POST METHODS (EXCEPT LOGOUT)

//the login route will return a users 'profile', this will be used by the cache manager,
//contains the user's settings, vote profile, etc.....
//SECURE
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/checkLogin', routes.checkLogin);

//SECURE

//split this up into sendContactRequest and confirmContactRequest?
app.post('/addContact', routes.addContact);

app.post('/createMessageChain', routes.createMessageChain);
app.post('/sendMessage', routes.sendMessage);

app.get('/validateUsername', routes.validateUsername);
app.post('/registerUser', routes.registerUser);
app.get('/verifyUser', routes.verifyUser);

app.post('/visitedTopic', routes.visitedTopic);
app.get('/recentlyVisited', routes.recentlyVisitedTopics);

//addVisitHeat
//addPostHeat
//addVoteHeat

app.get('/recentLocations', routes.getRecentLocations);
app.get('/recentChannels', routes.getRecentChannels);

app.get('/contactTopics', routes.getContactTopics);

app.post('/updateUserProfile', routes.updateUserProfile);
app.post('/updateLocationProfile', routes.updateLocationProfile);
app.post('/updateChannelProfile', routes.updateChannelProfile);

app.post('/createTopic', routes.createTopic);
app.post('/createComment', routes.createComment);
app.post('/createResponse', routes.createResponse);
app.post('/createReply', routes.createReply);

app.post('/upvoteTopic', routes.upvoteTopic);
app.post('/upvoteComment', routes.upvoteComment);
app.post('/upvoteResponse', routes.upvoteResponse);
app.post('/upvoteReply', routes.upvoteReply);

app.post('/createLocation', routes.createLocation);
app.post('/createChannel', routes.createChannel);

app.use(favicon(__dirname + '/../client/media/favicon.png'));


app.use(express.static(__dirname + '/../client'));

var options = {
  key: fs.readFileSync(__dirname + '/agoraSSL.key'),
  cert: fs.readFileSync(__dirname + '/agoraSSL.crt'),
};

//this is messing with the cookies somehow
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('express server listening on ports 80 and 443');  





