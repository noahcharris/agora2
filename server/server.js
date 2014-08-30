  
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
app.get('/topics', routes.getTopics);
app.get('/group', routes.getGroupForPath);
app.get('/groups', routes.getGroups);
app.get('/groupTopics', routes.getGroupTopics);
app.get('/subgroups', routes.getSubgroups);
app.get('/subgroupTopics', routes.getSubgroupTopics);
app.get('/place', routes.getPlace);
app.get('/user', routes.getUser);

//TODO
//will messages and registration be http??
//app.get('/messages')


app.post('/login', routes.login);
app.get('/logout', routes.logout);

app.post('/createTopic', routes.createTopic);
app.post('/createGroupTopic', routes.createGroupTopic);
app.post('/createSubgroupTopic', routes.createSubgroupTopic);
app.post('/createComment', routes.createComment);
app.post('/createReply', routes.createReply);
app.post('/createGroup', routes.createGroup);
app.post('/createUser', routes.createUser);

app.use(favicon(__dirname + '/../client/media/favicon.png'));


app.use(express.static(__dirname + '/../client'));  //hope this works
app.listen(app.get('port'));
console.log('express server listening on port %s', app.get('port'));





