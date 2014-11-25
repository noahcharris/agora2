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

    this.contacts = [];

    this.set('cacheManager', null);

    

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
    //###########  CACHE MANAGERS  ##########
    //#######################################


    var cacheManager = this.CacheManager(this);
    this.set('cacheManager', cacheManager);

    cacheManager.start();


    


    //#######################################
    //#########  TOPIC RETRIEVAL AJAX  ######
    //#######################################


    //NEW TRIGGGER
    //switch between topic filters, need to include this kind of stuff in the method above as well

    //takes page for pagination of topics
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
          //LOL BECAUSE THE DEFAULT WAS '' I WAS GETTING index.html back
          urlPath = '/topics-top-day';
          break;
      }

      console.log('ajax request to: ', urlPath);
      $.ajax({
        url: 'http://localhost:80' + urlPath,
        crossDomain: true,
        method: 'GET',
        data: {
          location: location,
          channel: that.get('channel'),
          page: that.get('sidebarView').page
        },
        success: function(data) {
          if (data) {
            topicsCollection = data;
            console.log('server returned: ', data);

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

    //TAKES A CALLBACK
    this.on('reloadSidebarContacts', function(cb) { 

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

            that.contacts = data;
            console.log('server returned: ', data);
            //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S

            for (var i=0; i < data.length ;i++) {
              data[i].isContact = true;
            }

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

    //TAKES A CALL BACK (USED IN DetailUserEntryView)
    this.on('reloadSidebarMessageChains', function(cb) { 

    cb = cb || function() { /*oi.io*/ };

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
            cb();
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
    
  },




  //sorta like mapController's goToPath()
  //but way easier

  changeChannel: function(channel) {

    this.set('channel', channel);
    this.trigger('reloadSidebarTopics', this.get('mapController').get('location'));

  },












  //WHAAAAAT?????

  showUser: function() {

  },

  showLocation: function() {

  },

  showChannel: function() {

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

    //MODEL 2 is some bullshittttttt
    region.show = function(view, model, model2) {


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
        //MODEL 2 FUUUUCCKKCKCKCKCK
        view[renderMethod](model, model2);
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

  
  CacheManager: function(appController) {
    var manager = {};
    manager.app = appController;

    manager.start = function() {

      this.getNotifications();


    };

    manager.getNotifications = function() {

      var that = this;
      console.log('THIS: ', that);

      $.ajax({
        url: 'http://localhost:80/notifications',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username')
        },
        success: function(data) {
          if (data) {
            console.log('CACHE MANAGER');
            console.log('server returned: ', data);

            if (data.contactRequests.length > 0) {

              $('#notificationsButton').css('background-color', 'red');

              $('#notificationsButton')[0].onclick = function() {

                contactRequestTemplate = _.template( $('#contactRequestTemplate').html() );
                newMessageTemplate = _.template( $('#newMessageTemplate').html() );
                topicActivityTemplate = _.template( $('#topicActivityTemplate').html() );


                //CONTACT REQUESTS

                var cssAdjust = -75;
                for (var i=0; i < data.contactRequests.length ;i++) {

                  var $notificationBox = $( contactRequestTemplate(data.contactRequests[i]) );

                  (function(){
                    var x = data.contactRequests[i].sender;
                    $notificationBox.on('click', function() {
                      var thet = this;

                      $.ajax({
                        url: 'http://localhost:80/user',
                        method: 'GET',
                        crossDomain: true,
                        data: {
                          username: x,
                          extra: Math.floor((Math.random() * 10000) + 1)
                        },
                        success: function(data) {
                          if (data) {
                            that.app.get('detailView').displayed = 'Users';
                            console.log('server returned: ', data);

                            $(thet).remove();

                            that.app.get('content2').show(that.app.get('detailView'), data[0]);
                          } else {
                            console.log('no data returned from server');
                          }
                        }, error: function(err) {
                          console.log('ajax error ocurred: ', err);
                        }

                      });

                    });

                  })();


                  $('#notificationsDisplay').append($notificationBox);

                  $notificationBox.css('bottom', cssAdjust+'px');
                  cssAdjust -= 50;


                }


                //NEW MESSAGES

                for (var i=0; i < data.newMessages.length ;i++) {

                  var $notificationBox = $( newMessageTemplate(data.newMessages[i]) );

                  (function() {
                    $notificationBox.on('click', function() {
                      $(this).remove();
                    });
                  })();


                  $('#notificationsDisplay').append($notificationBox);

                  $notificationBox.css('bottom', cssAdjust+'px');
                  cssAdjust -= 50;

                }




              };


            }

          } else {
            console.log('nothing returned for notifications');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    };


    manager.addTopicsCollection = function() {
      console.log('adding topics to cache');
    };



    return manager;

  }




});




