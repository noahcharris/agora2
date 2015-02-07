window.Agora = window.Agora || {};

Agora.Router = Backbone.Router.extend({


  //NEED TO ADD ROUTES FOR INDIVIDUAL USERS AND TOPICS

  routes: {
    '': 'index',
    'topic/:id': 'topic',
    'Topic/:id': 'topic',
    'user/:username': 'user',
    'User/:username': 'user',
    'location/:location': 'location',
    'Location/:location': 'location',
    'channel/:channel': 'channel',
    'Channel/:channel': 'channel',
    'World*path': 'path'
  },

  initialize: function(appController) {
    this.app = appController;
  },

  index: function() {
    this.app.trigger('reloadSidebarTopics', 'World');
  },

  topic: function(id) {
    //SHOW THE TOPIC, AT THE TOP OF ITS ORIGIN
    var that = this;
    $.ajax({
      url: 'http://egora.co:80/topicTree',
      // url: 'http://localhost/topicTree',
      method: 'GET',
      crossDomain: true,
      data: {
        topicId: id
      },
      success: function(model) {
        that.app.get('detailView').displayed = 'Topics';
        that.app.changeChannel(model.channel);
        that.app.get('mapController').goToPath(model.location);
        
        //need to insert topic into the front of the topics collection
        that.app.get('sidebarView').displayed = 'Topics-Top';
        //use this crazy callback shit to highlight
        var cb = function() {
          var subViews = that.app.get('sidebarView').subViews;
          for (var i=0; i < subViews.length ;i++) {
            if (subViews[i].model.id === model.id) {
              subViews[i].$el.addClass('highlight');
              //maybe scroll also here
            }
          }
        };
        that.app.trigger('reloadSidebarTopics', that.app.get('mapController').get('location'), model, cb);
        that.app.get('content2').show(that.app.get('detailView'), model);
      },
      error: function() {
        console.log('ajax error');
      }
    });


  },

  path: function(path) {
    if (!path) {
      this.index();
    } else {
      var temp = path.split('#');
      var location, channel;

      if (temp[0] === '') {
        location = 'World';
      } else {
        location = 'World' + temp[0];
      }

      if (temp[1] === '') {
        channel = 'All';
      } else {
        channel = temp[1];
      }

      //CAPITALIZE
      var temp1 = location.split('/');
      var temp2 = channel.split('/');
      for (var i=0; i < temp1.length ;i++) {
        var x = temp1[i].split(' ');
        for (var j=0; j < x.length ;j++) {
          x[j] = x[j][0].toUpperCase() + x[j].slice(1,x[j].length);
        }
        temp1[i] = x.join(' ');
      }
      location = temp1.join('/');

      for (var i=0; i < temp2.length ;i++) {
        var y = temp2[i].split(' ');
        for (var j=0; j < y.length ;j++) {
          y[j] = y[j][0].toUpperCase() + y[j].slice(1,y[j].length);
        }
        temp2[i] = y.join(' ');
      }
      channel = temp2.join('/');


      this.app.changeChannel(channel);
      this.app.get('mapController').goToPath(location);

    }
  },



  user: function(username) {
    var that = this;
    $.ajax({
      url: 'http://egora.co:80/user',
      // url: 'http://localhost:80/user',
      method: 'GET',
      crossDomain: true,
      data: {
        username: username,
        //so that this is never cached
        extra: Math.floor((Math.random() * 10000) + 1)
      },
      success: function(data) {
        if (data[0]) {
          that.app.get('detailView').displayed = 'Users';

          
          that.app.get('mapController').goToPath(data[0].location);

          //CHECK TO SEE IF THE USERNAME IS THE USER AND GENERATE A RANDOM STRING TO 
          //ATTACH TO THE REQUEST SO THAT WE DON'T CACHE THE IMAGE
          //SO THAT CHANGING A PROFILE PICTURE IS A SEAMLESS EXPERIENCE

          //JUST GOING TO DO THIS FOR NOW, BUT I NEED A SYSTEM
          //SAME SITUATION AS UPVOTES AND EXPAND/CONTRACT

          that.app.get('content2').show(that.app.get('detailView'), data[0]);

        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });

  },

  location: function(location) {

    var temp1 = location.split('/');
    for (var i=0; i < temp1.length ;i++) {

      var temp2 = temp1[i].split(' ');
      for (var j=0; j < temp2.length ;j++) {

        temp2[j] = temp2[j][0].toUpperCase() + temp2[j].slice(1, temp2[j].length);

      }

      temp1[i] = temp2.join(' ');

    }
    var input = 'World' + temp1.join('/');

    //SHOW THE LOCATION PROFILE
    this.app.changeChannel('All');
    this.app.get('mapController').goToPath(input);
    this.app.showLocationDetailView(input);
  },

  channel: function(channel) {

    var temp1 = channel.split('/');
    for (var i=0; i < temp1.length ;i++) {

      var temp2 = temp1[i].split(' ');
      for (var j=0; j < temp2.length ;j++) {

        temp2[j] = temp2[j][0].toUpperCase() + temp2[j].slice(1, temp2[j].length);

      }

      temp1[i] = temp2.join(' ');

    }
    var input = temp1.join('/');
    //SHOW THE CHANNEL PROFILE
    this.app.changeChannel(input);
    this.app.get('mapController').showWorld();
    this.app.showChannelDetailView(input);
  },


  
});
