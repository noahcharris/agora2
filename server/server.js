  
var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');

var session = require('express-session');

var cookie = require('cookie');


var bodyParser = require('body-parser');

var sessions = require('client-sessions');

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var csrf = require('csurf');

//use serve-favicon instead!!!
var favicon = require('static-favicon');

var routes = require('./routes.js');

app = express();

  

// app.use(function(request, response, next) {   //middleware is cool
//   console.log('received '+request.method+' request at '+request.url);
//   next();
// });

app.use(bodyParser());


app.set('trust proxy', 1) // trust first proxy

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

  app.use(sessions({
    cookieName: 'mySession', // cookie name dictates the key name added to the request object
    path: '/',
    secret: 'blargadeeblargblarg', // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  }));

//   app.use(function(req, res, next) {
//   if (req.mySession.seenyou) {
//     res.setHeader('X-Seen-You', 'true');
//   } else {
//     // setting a property will automatically cause a Set-Cookie response
//     // to be sent
//     req.mySession.seenyou = true;
//     res.setHeader('X-Seen-You', 'false');
//   }
//   next();
// });




//EXPRESS-SESSION THIS SHIT DID NOT SEEM TO WORK
//idk what this does exactly, something for the 'secure' cookies
//apparently this is a security hole though...
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
//could I do some of this on the client (static location?)
//or maybe the cache manager keeps track of all the 
//locations and channels?? (there will be too many ..)
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

//MAP POINTS
app.get('/points', routes.getPoints);

//location profiles and user profiles and channel profiles
app.get('/user', routes.getUser);

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

//SECURE
app.post('/addContact', routes.addContact);
app.post('/createMessageChain', routes.createMessageChain);
app.post('/sendMessage', routes.sendMessage);

app.post('/registerUser', routes.registerUser);

//SECURE
app.post('/updateUserProfile', routes.updateUserProfile);
app.post('/updateLocationProfile', routes.updateLocationProfile);
app.post('/updateChannelProfile', routes.updateChannelProfile);

//SECURE
app.post('/createTopic', routes.createTopic);
app.post('/createComment', routes.createComment);
app.post('/createResponse', routes.createResponse);
app.post('/createReply', routes.createReply);


//SECURE
app.post('/upvoteTopic', routes.upvoteTopic);
app.post('/upvoteComment', routes.upvoteComment);
app.post('/upvoteResponse', routes.upvoteResponse);
app.post('/upvoteReply', routes.upvoteReply);

//SECURE
app.post('/createLocation', routes.createLocation);
app.post('/createChannel', routes.createChannel);

app.use(favicon(__dirname + '/../client/media/favicon.png'));


app.use(express.static(__dirname + '/../client'));

var options = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem'),
};

//this is messing with the cookies somehow
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('express server listening on ports 80 and 443');  





