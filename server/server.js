  
var express = require('express');
var path = require('path');
var routes = require('./routes.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var csrf = require('csurf');
var favicon = require('static-favicon');


app = express();
app.set('port', 8080);

  

// app.use(function(request, response, next) {   //middleware is cool
//   console.log('received '+request.method+' request at '+request.url);
//   next();
// });

app.use(bodyParser());
app.use(cookieParser('secret'));
app.use(cookieSession({
  keys: ['a', 'b']
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


app.get('/dance', routes.danceParty);

app.get('/points', routes.getPoints);
app.get('/place', routes.getPlace);
app.get('/user', routes.getUser);


app.get('/topics', routes.getTopics);
//new topics routes with the three filters
app.get('/topics-top', routes.getTopTopics);
app.get('/topics-new', routes.getNewTopics);
app.get('/topics-hot', routes.getHotTopics);

//TODO
//this will return a 'conversation' (replacing the idea of 'messages') for each user
//users should only be able to have like 150 contacts or smthn before they have to pay
app.get('/contacts', routes.getContacts);
app.post('/sendMessage', routes.sendMessage);

//could I do some of this on the client (static location?)
//or maybe the cache manager keeps track of all the 
//locations and channels?? (there will be too many ..)
app.get('/pathSearch', routes.getPathSearchResults);
app.get('/channelSearch', routes.getChannelSearchResults);

app.get('/search', routes.search);

//this is how users will change their settings/public profile
app.post('/updateProfile', routes.updateProfile);

//the login route will return a users 'profile', this will be used by the cache manager,
//contains the user's settings, vote profile, etc.....
app.post('/login', routes.login);
app.get('/logout', routes.logout);

app.post('/createTopic', routes.createTopic);
app.post('/createComment', routes.createComment);
app.post('/createReply', routes.createReply);
app.post('/createUser', routes.createUser);

app.use(favicon(__dirname + '/../client/media/favicon.png'));


app.use(express.static(__dirname + '/../client'));
app.listen(app.get('port'));
console.log('express server listening on port %s', app.get('port'));





