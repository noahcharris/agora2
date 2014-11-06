window.Agora = window.Agora || {};
window.Agora.Controllers = window.Agora.Controllers || {};

Agora.Controllers.AppController = Backbone.Model.extend({

  defaults: {
    mobile: false,
  },



  initialize: function() {

    this.set('expanded', false);
    //whether we are displaying sidebar and map side-by-side or in lieu of each other
    this.set('mobile', false);
    //whether in 'mobile' mode, whether it is displaying map or topics
    this.set('mobilemap', true);
    //keep track of channel here, could be somewhere else probably
    this.set('channel', 'General');
    // ## INSTANTIATE REGION MANAGERS ##
    content1 = this.RegionManager1('#content1');
    content2 = this.RegionManager2('#content2');
    this.set('content1', content1);
    this.set('content2', content2);

    //not logged in initially
    //BUT NEED TO ASK SERVER HERE WHETHER WE ARE OR NOT
    this.set('login', false);







    //#######################################
    //#########  MOCK DATA  #################
    //#######################################
    
    var defaultCollection = [{ id: 1,
      headline: 'Defaults are desecrets',
      type: 'Topic',
      poster: 'thalonius want',
      contents: 'Unce more breach. Twice too many.',
      city: 'Oregon',
      area: 'Hack Reactor',
      reputation: 42,
      upvoted: true,
      expanded: true,   //this is for the outer expansion/contraction button
      comments: [{
        id: 22,
        headline: 'fuck off',
        poster: 'J-aldrean',
        contents: 'This dream, no more a dream than waking',
        upvoted: true,
        expanded: false,    //these are for each group of responses
        responses: [{
            poster: 'Mr. Bean',
            headline: 'fuck off',
            contents: 'You sir, are a ruffian.',
            upvoted: false,
        }, {
            poster: 'Mr. Bean',
            headline: 'fuck off',
            contents: 'I mean it..',
            upvoted: false,
        }]
      }, {
        id: 87,
        headline: 'fuck off',
        poster: 'Jason Aldean',
        contents: 'Ok, but how about them yanks?',
        upvoted: false,
        expanded: false,
        responses: [{
            poster: 'Heckles',
            headline: 'fuck off',
            contents: 'Just the one.'
        }]
      }] 
    }];

    var searchCollection = [
      { id: 1,
        headline: 'Defaults are desecrets',
        type: 'Topic',
        poster: 'thalonius want',
        contents: 'Unce more breach. Twice too many.',
        upvoted: false,
        expanded: false,
        city: 'Oregon',
        area: 'Hack Reactor',
        reputation: 42,
        comments: [{
          id: 22,
          poster: 'J-aldrean',
          contents: 'This dream, no more a dream than waking',
          upvoted: false,
          expanded: false,
          responses: [{
              poster: 'Mr. Bean',
              contents: 'You sir, are a ruffian.',
              upvoted: false,
          }, {
              poster: 'Mr. Bean',
              contents: 'I mean it..',
              upvoted: false,
          }]
        }, {
          id:87,
          poster: 'Jason Aldean',
          contents: 'Ok, but how about them yanks?',
          upvoted: false,
          expanded: false,
          responses: [{
              poster: 'Heckles',
              contents: 'Just the one.',
              upvoted: false,
          }]
        }] 
    }, {
      id: 3,
      type: 'Place',
      name: 'Hack Reactor',
      latitude: 37.7833,
      longitude: 122.4167,
      reputation: 42,
      city: 'San Francisco'
    }];


    var messagesCollection = [{
      id: 0,
      type: 'Message',
      sender: 'noahcharris',
      recipient: 'spw',
      contents: 'yo'
    }, {
      id: 1,
      type: 'Message',
      sender: 'noahcharris',
      recipient: 'spw',
      contents: 'wooo'
    }];

    var usersCollection = [{
      id: 0,
      type: 'User',
      name: 'Noah Harris',
      origin: 'Seattle'
    }, {
      id: 0,
      type: 'User',
      name: 'Noah Harris',
      origin: 'Seattle'
    }];





    //#######################################
    //#########  VIEWS AND MODELS  ##########
    //#######################################


    var topbarModel = { user: 'not logged in'};
    var topbarView = new Agora.Views.TopbarView(this);
    topbarView.model = topbarModel;

    $('#topbar1').append(topbarView.$el);
    this.set('topbarView', topbarView);

    topbarView.render();



    //possible removal in agora2
    // var dropdownView = new Agora.Views.DropdownView(this);
    // this.set('dropdownView', dropdownView);
    // $('#topbarWrapper').append(dropdownView.$el);

    // dropdownView.render();



    var sidebarView = new Agora.Views.SidebarView(this); //collection from TopicsCollection
    sidebarView.collection = defaultCollection;
    sidebarView.searchCollection = searchCollection;
    sidebarView.messagesCollection = messagesCollection;
    sidebarView.usersCollection = usersCollection;
    this.set('sidebarView', sidebarView);

    var detailView = new Agora.Views.DetailView(this);
    this.set('detailView', detailView);


    var settingsView = new Agora.Views.SettingsView(this);
    this.set('settingsView', settingsView);


    // THE MAP 
    //putting this above the sidebar stuff fucks up the map?
    var mapController = new Agora.Controllers.MapController(this);
    this.set('mapController', mapController);

    var router = new Agora.Router();
    mapController.router = router;
    router.app = this;

    var pathView = new Agora.Views.PathView({ model:mapController });
    pathView.app = this;
    pathView.router = router;
    pathView.render();
    $('#topbar2').append(pathView.$el);

    var channelView = new Agora.Views.ChannelView({ model: mapController });
    channelView.app = this;
    channelView.router = router;
    channelView.render();
    $('#topbar2').append(channelView.$el);
    channelView.setHandlers();

    var registrationView = new Agora.Views.RegistrationView(this);
    this.set('registrationView', registrationView);

    var alertView = new Agora.Views.AlertView(this);
    this.set('alertView', alertView);

    var placementView = new Agora.Views.PlacementView(this);
    this.set('placementView', placementView);


    //WHAT THE FUCK??
    //need to use this setTimeout otherwise the cancelled tiles are loaded
    setTimeout(function() { Backbone.history.start(); }, 10);


    // ## PATHVIEW EVENTING ##

    var that = this;

    //sets up the highlighting interaction between sidebarView and detailView
    mapController.on('change:location', function() {
      pathView.render();
      pathView.setHandlers();
    });

    mapController.on('change:group', function() {
      pathView.render();
      pathView.setHandlers();
    });

    pathView.render();
    pathView.setHandlers();

    


    //#######################################
    //#########  TOPIC RETRIEVAL AJAX  ######
    //#######################################

    //OLD TRIGGER (NO FILTERS)
    //need alot more of these methods, topics-top, topics-new

    mapController.on('reloadSidebar', function(location) {
      console.log('mapController event: reloadSidebar');


      var urlPath;
      switch(that.get('sidebarView').displayed) {
        case 'Topics-Top':
          urlPath = '/topics-top';
          break;
        case 'Topics-New':
          urlPath = '/topics-new';
          break;
        case 'Topics-Hot':
          urlPath = '/topics-hot';
          break;
        default:
          urlPath = '';
          break;
      }

      console.log('ajax request to: ', urlPath);
      $.ajax({
        url: 'http://localhost:8080'+urlPath,
        data: {
          location: location,
          channel: that.get('channel')
        },
        crossDomain: true,
        success: function(data) {
          console.log(data);

          for (var i=0;i<data.length;i++) {
            data[i].type = 'Topic';
            data[i].reputation = 0;
          }
          topicsCollection = data;
          //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
          sidebarView.collection.models = topicsCollection;
          content1.show(sidebarView);

          //take detailView into account while moving around
          //pretty sure I don't need this stuff if I want detailview to close on navigation
          // if (that.get('expanded')) {
          //   if ($('#content2').children()[0] && $('#content2').children()[0].className === 'detailView') {
          //     content2.show(that.get('detailView'));
          //   }
          // }

        },
        error: function(data) {
          console.log(data);
        }
      });

      
    });

    //NEW TRIGGGER
    //switch between topic filters, need to include this kind of stuff in the method above as well

    this.on('reloadSidebarTopics', function(location) { 

      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarTopics');

      var location = location || that.get('mapController').get('location');

      var urlPath;
      switch(that.get('sidebarView').displayed) {
        case 'Topics-Top':
          urlPath = '/topics-top';
          break;
        case 'Topics-New':
          urlPath = '/topics-new';
          break;
        case 'Topics-Hot':
          urlPath = '/topics-hot';
          break;
        default:
          urlPath = '';
          break;
      }

      console.log('ajax request to: ', urlPath);
      $.ajax({
        url: 'http://localhost:8080' + urlPath,
        crossDomain: true,
        data: {
          location: location,
          channel: that.get('channel')
        },
        success: function(data) {
          if (data) {
            topicsCollection = data;
            console.log('server returned: ', data);
            //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
            sidebarView.collection.models = topicsCollection;
            content1.show(sidebarView); 
          } else {
            console.log('memcached returned false');
            sidebarView.collection.models = defaultCollection;
            content1.show(sidebarView);
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      })



    });





    //#######################################
    //#########  RESIZING  ##################
    //#######################################

    var throttledResize = _.throttle(function() {

      if ($(window).width() > 500) {

        that.set('mobile', false);
        $('#sidebarContainer').show();
        $('#map').css('width', '70%');
        $('#mobileSelectionBarWrapper').css('height', '0px');


        var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
        var sidebarWidth = $(window).width() - mapWidth;

        if (!that.get('expanded')) {  
          $('#sidebarContainer').css('-webkit-transition-duration', '0s');
          $('#sidebarContainer').css('width', sidebarWidth+'px');

          $('#content1').css('width', sidebarWidth+'px');

        } else {
          $('#content1').css('width', sidebarWidth+'px');
          //need the extra -2 for borders?
          $('#content2').css('width', ($(window).width() * 0.75) - sidebarWidth - 5);
          //maybe turn off animations here
          $('#sidebarContainer').css('-webkit-transition-duration', '0s');
          $('#sidebarContainer').css('width', $(window).width() * 0.75);
        }

      } else {

        that.set('mobile', true);
        $('#mobileSelectionBarWrapper').css('height', '40px');

        //need a variable which determines whether topics or map is selected if 'mobile'

        $('#sidebarContainer').hide();
        $('#map').css('width', '100%');

      }

      //THROTTLE TIME (PERHAPS VARY THIS DEPENDING ON USER AGENT??)
    }, 100);

    $(window).on('resize', throttledResize);

    throttledResize();

    var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
    var sideWidth = $(window).width() - mapWidth;
    $('#content1').css('width', sideWidth+'px');


    
  },










  //#######################################
  //#########  REGION MANAGERS  ###########
  //#######################################

  RegionManager1: function(id) {
    var currentView;
    var el = id;
    var region = {};
    var that = this;
  
    region.show = function(view) {
      if (view) {
        if (currentView && currentView.close) {
          currentView.close();
        }
        currentView = view;
        view.render();  
        $(el).html(view.el);
        if (view.onShow) {
          view.onShow();
        }
        if (view.setHandlers) {
          view.setHandlers();
        }
      }
    };

    region.hide = function() {
      if (currentView)
        currentView.close();
      currentView = null;
    };
    return region;
  },

  RegionManager2: function(id) {
    var el = id;
    var region = {};
    var currentView = null;
    var that = this;

    //I'm going to put a callback into content2.show for
    //cases like response box
    region.show = function(view, model) {


      //if we're showing a topic we have to do some dumb shit apparently
      var renderMethod;

      if (that.get('detailView').displayed === 'Topics') {
        switch (that.get('sidebarView').displayed) {
          case 'Topics-Top':
            renderMethod = 'renderTopic'
            break;
          case 'Topics-New':
            renderMethod = 'renderTopic'
            break;
          case 'Topics-Hot':
            renderMethod = 'renderTopic'
            break;
          default:
            renderMethod = 'render';
            break;
        }
      } else {
        renderMethod = 'render';
      }


      if (currentView && currentView.close) {
        currentView.close();
      }


      if (that.get('expanded')) {
        var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
        var sideWidth = $(window).width() - mapWidth;
        //TODO
        $('#content1').css('width', sideWidth+'px');

        currentView = view;
        if (view) {
          view[renderMethod](model);
          $(el).html(view.el);
          if (view.onShow)
            view.onShow();
          if (view.setHandlers)
            view.setHandlers();
        }
        $('#content2').css('width', ($(window).width() * 0.75) - sideWidth - 5);

      } else {

        that.set('expanded', true);
        //as long as I don't have any other listeners on the sidebarContainer this will work
        //$('#sidebarContainer').unbind();
        $('#sidebarContainer').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {

          currentView = view;
          if (view) {
            view[renderMethod](model);
            $(el).html(view.el);
            if (view.onShow)
              view.onShow();
            if (view.setHandlers)
              view.setHandlers();

          }

          //need to set the css for detailView after expansion
          var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
          var sideWidth = $(window).width() - mapWidth;
          $('#content1').css('width', sideWidth+'px');
          //need the extra -2 for borders?
          $('#content2').css('width', ($(window).width() * 0.75) - sideWidth - 5);
          $('#sidebarContainer').unbind();
        });
        $('#sidebarContainer').css('-webkit-transition-duration', '1s');

        //this is where content2 changes the size of the sidebarcontainer
        $('#sidebarContainer').css('width', $(window).width() * 0.75);

        var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
        var sideWidth = $(window).width() - mapWidth;
        $('#content1').css('width', sideWidth+'px');
      }
    };





    region.hide = function() {
      //debugger;
      if (currentView && currentView.close) {
        currentView.close();
      }
      currentView = null;
      $('#sidebarContainer').css('-webkit-transition-duration', '1s');
      var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
      var sideWidth = $(window).width() - mapWidth;
      $('#sidebarContainer').css('width', sideWidth+'px');
      that.set('expanded', false);
    };

    return region;
  },



  //#######################################
  //#########  HISTORY MANAGERS  ##########
  //#######################################

  //keep

  //Agora caching, let's say caching occurs over 15 second (to start, for topics) seconds

  //longer cache for users, places, 

  //if we have the collection in cache, use that instead of making ajax call,
  //unless the time period is up, at which point grab a new one, replace and delete the old one

  
  CacheManager: function() {
    var manager = {};

    manager.addTopicsCollection = function() {
      console.log('adding topics to cache');
    };



    return manager;

  }




});




