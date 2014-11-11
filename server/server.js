  
var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');
var session = require('express-session');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var csrf = require('csurf');
var favicon = require('static-favicon');

var routes = require('./routes.js');

app = express();

  

// app.use(function(request, response, next) {   //middleware is cool
//   console.log('received '+request.method+' request at '+request.url);
//   next();
// });

app.use(bodyParser());


// app.use(cookieParser('secret'));
// app.use(cookieSession({
//   keys: ['a', 'b']
// }));


//idk what this does exactly, something for the 'secure' cookies
//apparently this is a security hole though...
app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'keyboard cat',
  cookie: { path: '/', httpOnly: true, secure: true, maxAge: null },
  //adding these two made some warnings go away so w2snare
  // resave: true,
  // saveUninitialized: true
}));

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

app.get('/locationSubtree', routes.getLocationSubtree);
app.get('/channelSubtree', routes.getChannelSubtree);

//users should only be able to have like 150 contacts or smthn before they have to pay
app.get('/contacts', routes.getContacts);
app.get('/messages', routes.getMessages);

app.get('/messageChain', routes.getMessageChain);

//MAP POINTS
app.get('/points', routes.getPoints);

//location profiles and user profiles and channel profiles
app.get('/user', routes.getUser);
app.get('/location', routes.getLocation);
app.get('/channel', routes.getChannel);

app.get('/notifications', routes.getNotifications);


//POST METHODS (EXCEPT LOGOUT)

//the login route will return a users 'profile', this will be used by the cache manager,
//contains the user's settings, vote profile, etc.....
app.post('/login', routes.login);
app.get('/logout', routes.logout);

app.post('/addContact', routes.addContact);
app.post('/sendMessage', routes.sendMessage);

app.post('/registerUser', routes.registerUser);
app.post('/updateUserProfile', routes.updateUserProfile);
app.post('/updateLocationProfile', routes.updateLocationProfile);

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
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem'),
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('express server listening on ports 80 and 443');  





