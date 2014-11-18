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

    


    //CHANGE THESE BACK

    this.set('username', 'noahcharris'); //is this secure???

    this.set('origin', 'United States');

    //not logged in initially
    //BUT NEED TO ASK SERVER HERE WHETHER WE ARE OR NOT

    this.set('login', true);





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


    var defaultCollection = [];
    var searchCollection = [];
    var messagesCollection = [];

    var sidebarView = new Agora.Views.SidebarView(this); //collection from TopicsCollection
    sidebarView.collection = defaultCollection;
    sidebarView.searchCollection = searchCollection;
    sidebarView.messagesCollection = messagesCollection;
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

    var locationView = new Agora.Views.LocationView({ model:mapController });
    locationView.app = this;
    locationView.router = router;
    locationView.render();
    $('#topbar2').append(locationView.$el);

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


    // ## LOCATIONVIEW EVENTING ##

    var that = this;

    //sets up the highlighting interaction between sidebarView and detailView
    mapController.on('change:location', function() {
      locationView.render();
      locationView.setHandlers();
    });

    mapController.on('change:group', function() {
      locationView.render();
      locationView.setHandlers();
    });

    locationView.render();
    locationView.setHandlers();

    


    //#######################################
    //#########  TOPIC RETRIEVAL AJAX  ######
    //#######################################


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
          var $suffix = $('#timeframeSelect').val();
          $suffix = $suffix || 'day';
          urlPath += ('-' + $suffix);
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
        url: 'http://localhost:80' + urlPath,
        crossDomain: true,
        method: 'GET',
        data: {
          location: location,
          channel: that.get('channel')
        },
        success: function(data) {
          if (data) {
            topicsCollection = data;
            console.log('server returned: ', data);
            //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
            sidebarView.collection = data;
            content1.show(sidebarView); 
          } else {
            console.log('memcached returned false');
            sidebarView.collection = defaultCollection;
            content1.show(sidebarView);
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    });


    this.on('reloadSidebarContacts', function(location) { 

      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarContacts');

      var username = that.get('username');

      $.ajax({
        url: 'http://localhost:80/contacts',
        crossDomain: true,
        method: 'GET',
        data: {
          username: username
        },
        success: function(data) {
          if (data) {
            //topicsCollection = data;
            console.log('server returned: ', data);
            //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
            sidebarView.contactsCollection = data;
            content1.show(sidebarView); 
          } else {
            console.log('memcached returned false');
            content1.show(sidebarView);
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    });


    this.on('reloadSidebarMessageChains', function(location) { 

      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarMessageChains');


      $.ajax({
        url: 'http://localhost:80/messages',
        crossDomain: true,
        method: 'GET',
        data: {
          username: that.get('username')
        },
        success: function(data) {
          if (data) {
            //topicsCollection = data;
            console.log('server returned: ', data);
            //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
            sidebarView.messagesCollection = data;
            content1.show(sidebarView); 
          } else {
            console.log('memcached returned false');
            content1.show(sidebarView);
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

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


    //fucking around with mapController

    // console.log('layers: ', this.get('mapController').get('countries'));
      // this.get('mapController').highlightCountry('United States');
      // this.get('mapController').highlightCountry('China');
      // this.get('mapController').highlightCountry('France');
      // this.get('mapController').highlightCountry('Germany');
      // this.get('mapController').highlightCountry('Argentina');
      // this.get('mapController').highlightCountry('Australia');
      // this.get('mapController').highlightCountry('Monaco');
      // this.get('mapController').highlightCountry('Italy');
      // this.get('mapController').highlightCountry('Ecuador');
      // this.get('mapController').highlightCountry('Palestine');

    // $('body').on('click', function() {
    //   that.get('mapController').removeHighlightCountry('United States');
    // });





    
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

      //i really could just reduce all these Topics-* to one topic display...
      switch (that.get('detailView').displayed) {
        case 'Topics-Top':
          renderMethod = 'renderTopic';
          break;
        case 'Topics-New':
          renderMethod = 'renderTopic';
          break;
        case 'Topics-Hot':
          renderMethod = 'renderTopic';
          break;
        case 'Topics':
          renderMethod = 'renderTopic';
          break;
        case 'Messages':
          renderMethod = 'renderMessage';
          break;
        case 'Users':
          renderMethod = 'renderUser';
          break;
        case 'Contacts':
          renderMethod = 'renderUser';
          break;
        default:
          renderMethod = 'render';
          break;
      }
      console.log('render method: ', renderMethod);

      if (currentView && currentView.close) {
        currentView.close();
      }

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


      var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
      var sideWidth = $(window).width() - mapWidth;
      $('#content2').css('width', ($(window).width() * 0.75) - sideWidth - 5);

      $('#sidebarContainer').css('-webkit-transition-duration', '1s');

      //this is where content2 changes the size of the sidebarcontainer
      $('#sidebarContainer').css('width', $(window).width() * 0.75);
      that.set('expanded', true);

    };





    region.hide = function() {
      if (that.get('expanded')) {
        $('#sidebarContainer').css('-webkit-transition-duration', '1s');
        $('#sidebarContainer').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
          if (currentView && currentView.close) {
            currentView.close();
          }
          currentView = null;
        });
        
        var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
        var sideWidth = $(window).width() - mapWidth;
        $('#sidebarContainer').css('width', sideWidth+'px');
        that.set('expanded', false);
        $('#sidebarContainer').unbind();
      } else {
        if (currentView && currentView.close) {
          currentView.close();
        }
        currentView = null;
      }


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




