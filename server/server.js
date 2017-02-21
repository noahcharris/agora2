  
var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');

var routes = require('./routes.js');

var mailer = require('nodemailer');

var session = require('express-session');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var favicon = require('serve-favicon');

var timeEventLoop = require('time-eventloop');
timeEventLoop.start(/* { options } */);

require('crashreporter').configure({
    outDir: '/home/ec2-user/crashes',
    maxCrashFile: 1000,
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



app = express();

  

// app.use(function(request, response, next) {   //middleware is cool
//   console.log('received '+request.method+' request at '+request.url);
//   next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());


//COUNT HITS
var hitCount = 0;
app.use(function(request, response, next) {
  if (request.path === '/index.html') {
    hitCount++;
  }
  next();
});

hitWriteHandler = function() {
  fs.readFile(__dirname + '/../hits.txt', 'utf-8', function(err, data) {
    if (err) console.log('error reading from hits.txt: ', err);
    var temp = Number(data);
    temp += hitCount;

    fs.writeFile(__dirname + '/../hits.txt', temp, function(err) {
      if (err) throw err;
      console.log('recorded hit count');
      hitCount = 0;
    });

  });
};
//writes hitcount once every minute
setInterval(hitWriteHandler, 60000);




//IP BANNING
banArray = [];

app.use(function(request, response, next) {

  for (var i=0; i < banArray.length ;i++) {
    if (banArray[i] === request.ip) {
      //BANNED!∆!∆!∆!
      response.end('o_O');
    }
  }
  //console.log('serving user client at ip '+request.ip);
  next();
});



var accessList = ['http://egora.co', 'http://www.egora.co'];
app.use(function(request, response, next) {

  //need to read origin, check it against a list, and return allow access
  var origin = request.get('origin');
  for (var i=0; i < accessList.length; i++) {
    if (accessList[i] === origin) {
      response.setHeader('Access-Control-Allow-Origin', accessList[i]);
    }
  }
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  next();

});




//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

app.get('/', function(request, response) {
  response.redirect('/index.html');
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

//CACHE MANAGER
app.get('/notifications', routes.getNotifications);
app.get('/refreshToken', routes.refreshToken);

app.post('/clearActivity', routes.clearActivity);


//the login route will return a users 'profile', this will be used by the cache manager,
//contains the user's settings, vote profile, etc.....
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/checkLogin', routes.checkLogin);

app.get('/userEmail', routes.getEmail);
app.post('/changeEmail', routes.changeEmail);
app.post('/changePassword', routes.changePassword);
app.post('/changeLocation', routes.changeLocation);

app.post('/addContact', routes.addContact);


app.post('/createMessageChain', routes.createMessageChain);
app.post('/sendMessage', routes.sendMessage);

app.get('/validateUsername', routes.validateUsername);
app.get('/validateChannel', routes.validateChannel);
app.get('/validateLocation', routes.validateLocation);
app.post('/registerUser', routes.registerUser);
app.get('/verifyUser', routes.verifyUser);
app.get('/checkVerification', routes.checkVerification);
app.get('/resendVerification', routes.resendVerification);

app.get('/getInvites', routes.getInvites);


app.get('/authenticateTwitter', routes.authenticateTwitter);
app.get('/twitterCallback', routes.twitterCallback);


app.post('/visitedTopic', routes.visitedTopic);
app.get('/recentlyVisited', routes.recentlyVisitedTopics);

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

app.use(favicon(__dirname + '/../client/resources/images/favicon.png'));

app.use(express.static(__dirname + '/../client'));

var ca = [];
var chain = fs.readFileSync(__dirname + '/agoraCaBundle', 'utf-8');
chain = chain.split('\n');
cert = [];
for (var i=0; i < chain.length ;i++) {
  cert.push(chain[i]);
  if (chain[i] === '-----END CERTIFICATE-----') {
    ca.push(cert.join('\n'));
    cert = [];
  }
}

var options = {
  ca: ca,
  key: fs.readFileSync(__dirname + '/agoraSSL.key'),
  cert: fs.readFileSync(__dirname + '/agoraSSL.crt'),
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('---------------------------------------------------');  
console.log('-- express server listening on ports 80 and 443  --');
console.log('---------------------------------------------------');
console.log('---------------------------------------------------');
console.log(' ########  ######    #######  ########     ###     ');
console.log(' ##       ##    ##  ##     ## ##     ##   ## ##    ');
console.log(' ##       ##        ##     ## ##     ##  ##   ##   ');
console.log(' ######   ##   ###  ##     ## ########  ##     ##  ');
console.log(' ##       ##    ##  ##     ## ##   ##   #########  ');
console.log(' ##       ##    ##  ##     ## ##    ##  ##     ##  ');
console.log(' ########  ######    #######  ##     ## ##     ##  ');
console.log('---------------------------------------------------');
console.log('---------------------------------------------------');









