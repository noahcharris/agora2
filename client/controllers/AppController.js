window.Agora = window.Agora || {};
window.Agora.Controllers = window.Agora.Controllers || {};

Agora.Controllers.AppController = Backbone.Model.extend({

  defaults: {
    mobile: false,
    expanded: false
  },



  initialize: function(params) {
    var that = this;
    this.params = params;

    this.set('mobile', params.mobile);
    this.set('language', params.language);

    this.set('expanded', false);
    //whether we are displaying sidebar and map side-by-side or in lieu of each other
    this.set('mobile', false);
    //in 'mobile' mode, whether it is displaying map or topics
    this.set('mobilemap', true);

    //used to keep track of fullscreen for escape functionality
    this.set('imageFullscreen', false);

    this.set('notificationsDisplayed', false);

    //keep track of channel here, i wish location was here too.. but it is so tightly coupled right now
    this.set('channel', 'All');

    // ## REGION MANAGERS ##
    content1 = this.RegionManager1('#content1');
    content2 = this.RegionManager2('#content2');
    this.set('content1', content1);
    this.set('content2', content2);

    var cacheManager = this.CacheManager(this);
    this.set('cacheManager', cacheManager);
    this.set('cacheTimer', null);

    //at the end of initialization we ajax checkLogin to set these if user has a session
    this.set('username', null); //this is vulnerable to XSS
    this.set('login', false);
    this.set('token', null); //this is where we store token for csrf protection





    //#######################################
    //#########  VIEWS AND MODELS  ##########
    //#######################################


    var topbarModel = { username: 'Not Logged In'};
    var topbarView = new Agora.Views.TopbarView(this);
    topbarView.model = topbarModel;
    $('#topbar1').append(topbarView.$el);
    this.set('topbarView', topbarView);
    topbarView.render();

    var defaultCollection = [];
    var searchCollection = [];
    var messagesCollection = [];
    var contactsCollection = [];

    var sidebarView = new Agora.Views.SidebarView(this); //collection from TopicsCollection
    sidebarView.collection = defaultCollection;
    sidebarView.searchCollection = searchCollection;
    sidebarView.messagesCollection = messagesCollection;
    sidebarView.contactsCollection = contactsCollection;
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
    this.set('locationView', locationView);
    $('#topbar2').append(locationView.$el);
    locationView.render();

    var channelView = new Agora.Views.ChannelView({ model: mapController });
    //used by detailChannelView
    this.set('channelView', channelView);
    channelView.app = this;
    channelView.router = router;
    this.set('channelView', channelView);
    $('#topbar2').append(channelView.$el);
    channelView.render();
    channelView.setHandlers();

    var registrationView = new Agora.Views.RegistrationView(this);
    this.set('registrationView', registrationView);

    var placementView = new Agora.Views.PlacementView(this);
    this.set('placementView', placementView);


    // ## LOCATIONVIEW EVENTING ##

    //sets up the highlighting interaction between sidebarView and detailView
    mapController.on('change:location', function() {
      locationView.render();
    });



    //#######################################
    //#########  TOPIC RETRIEVAL AJAX  ######
    //#######################################

    //takes page for pagination of topics

    //THIS TAKES AN 'EXTRA' TOPIC WHICH IS UNSHIFTED INTO THE TOPICSCOLLECTION
    //THIS IS FOR SEARCH & 'RECENTLY VISITED'
    //GOING TO THROTTLE RELOAD SIDEBAR TOPICS BECAUSE I CALL IT SO MANY PLACES

    this.on('reloadSidebarTopics', function(location, extra, cb) { 
      cb = cb || function() {};

      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarTopics');

      var location = location || that.get('mapController').get('location');

      var urlPath;
      var secure = false;
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
        case 'Topics-Contacts':
          urlPath = '/contactTopics';
          secure = true;
          break;
        default:
          //LOL BECAUSE THE DEFAULT WAS '' I WAS GETTING index.html back
          urlPath = '/topics-top-day';
          break;
      }


      var url;
      var token;
      var username;
      if (secure) {
        //only send token and username if we are on SSL!!
        url = 'https://54.202.31.15:443' + urlPath;
        token = that.get('token');
        username = that.get('username');
      } else {
        url = 'http://54.202.31.15:80' + urlPath;
      }

      $.ajax({
        url: url,
        crossDomain: true,
        //but this is only for ssl, hope that's ok
        xhrFields: {
          withCredentials: true
        },
        method: 'GET',
        data: {
          location: location,
          channel: that.get('channel'),
          page: that.get('sidebarView').page,
          //THESE ARE ONLY ASSIGNED IF WE ARE SENDING OVER SSL FOR FRIENDS
          token: token,
          username: username
        },
        success: function(data) {
          if (data) {

            topicsCollection = data;
            sidebarView.collection = data;
            //add extra if it's not already there
            if (extra && _.pluck(data, 'id').indexOf(extra.id) === -1)
              sidebarView.collection.unshift(extra);
            content1.show(sidebarView); 


            //this cb is used by recently-visited-topics in settingsView to set highlight
            cb();
          } else {
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    });

    //TAKES A CALLBACK
    this.on('reloadSidebarContacts', function() { 

      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarContacts');

      var username = that.get('username');

      $.ajax({
        url: 'https://54.202.31.15:443/contacts',
        //url: 'http://localhost:80/contacts',
        crossDomain: true,
        method: 'GET',
        xhrFields: {
          withCredentials: true
        },
        data: {
          username: username,
          token: that.get('token')
        },
        success: function(data) {
          if (data) {

            that.contacts = data;
            that.get('cacheManager').contacts = data;
            //console.log('server returned: ', data);

            for (var i=0; i < data.length ;i++) {
              data[i].isContact = true;
            }

            sidebarView.contactsCollection = data;
            content1.show(sidebarView); 
          } else {
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    });

    //TAKES A CALL BACK (USED IN DetailUserEntryView)
    this.on('reloadSidebarMessageChains', function(cb, suppress) { 

      //supress stops sidebar from reloading

      cb = cb || function() { /*oi.io*/ };
      suppress = suppress || false;
      //TODO Go through cache manager here
      console.log('AppController event: reloadSidebarMessageChains');


      $.ajax({
        url: 'https://54.202.31.15:443/messages',
        //url: 'http://localhost:80/messages',
        crossDomain: true,
        method: 'GET',
        xhrFields: {
          withCredentials: true
        },
        data: {
          username: that.get('username'),
          token: that.get('token')
        },
        success: function(data) {
          if (data) {
            sidebarView.messagesCollection = data;
            if (!suppress) {
              content1.show(sidebarView); 
            }
            cb();
          } else {
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
      //resizeee

      //SETTING SIDEBAR CONTAINER AND MAP HEIGHT
      var height = $(window).height() - $('#topbarWrapper').height();
      $('#sidebarContainer').css('height', height);

      $('#mainWrapper').css('height', height);


      if ($(window).width() > 500) {

        that.set('mobile', false);
        $('#sidebarContainer').show();
        $('#map').css('width', '70%');


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

        //need a variable which determines whether topics or map is selected if 'mobile'

        $('#sidebarContainer').hide();
        $('#map').css('width', '100%');

      }
      //THROTTLE TIME (PERHAPS VARY THIS DEPENDING ON USER AGENT??)
    }, 100);

    $(window).on('resize', throttledResize);

    throttledResize();

    setTimeout(function() {

      throttledResize();

      // var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
      // var sideWidth = $(window).width() - mapWidth;
      // $('#content1').css('width', sideWidth+'px');

      // //do i need this extra bit down here??
      // // //SETTING SIDEBAR CONTAINER AND MAP HEIGHT
      // var height = $(window).height() - $('#topbarWrapper').height();
      // $('#sidebarContainer').css('height', height);
      // $('#map').css('height', height);
      
    }, 1000);






    //LOADER ANIMATION
    var $body = $('body');
    $body.children('#loader').hide();
    $(document).on({
        ajaxStart: function() { 
          $body.children('#loader').show();
          // $body.children('#loaderMask').show();
        },
        ajaxStop: function() { 
          $body.children('#loader').hide();
          // $body.children('#loaderMask').hide();
        }    
    });




    //CHECK INITIAL LOGIN STATE
    $.ajax({
      url: 'http://54.202.31.15:80/checkLogin',
      //url: 'http://localhost:80' + urlPath,
      //crossDomain: true,
      // xhrFields: {
      //   withCredentials: true
      // },
      method: 'GET',
      success: function(data) {
        if (data.login) {

          //login subroutine
          that.set('username', data.username);
          that.get('topbarView').render();
          that.set('token', data.token);
          that.set('login', true);

          that.trigger('reloadSidebarContacts');
          //the last argument suppresses reloading of content1
          that.trigger('reloadSidebarMessageChains', undefined, true);

          that.get('cacheManager').start();

          console.log('whaaaa: ', data.location);

          that.get('mapController').goToPath(data.location);


        } else {
          console.log('no session detected');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });



    //ESCAPE KEY BEHAVIOR

    //TODO 3 layers of escape

    $(document).keyup(function(e) {

      if ($('#inputBox').css('height')) {
        var height = $('#inputBox').css('height');
        height = height.slice(0, height.length-2);
      }

      if (e.keyCode === 27) {

        $('input').blur();
        $('textarea').blur();

        console.log(that.get('imageFullscreen'));
        if (that.get('imageFullscreen')) {
          $('#fullscreen').remove();
          //$('#fullscreenImage').hide();
          that.set('imageFullscreen', false);

        } else if (height > 0) {
          //didn't change the responding
          $('#inputBox').css('height', '0px');

          //IF LOCATION/CHANNEL VIEW SEARCH BAR HAS FOCUS, TURN IT OFF
          // IF DISPLAYING SEARCH RESULT, RETURN TO WORLD ALL
        } else if ($('#notificationsDisplay').children().length) {
          $('#notificationsDisplay').empty();
          that.set('notificationsDisplayed', false);
        } else if ($('#pathInput').length || $('#channelInput').length) {
          $('#pathInput').remove();
          $('#channelInput').remove();
          that.changeChannel('All');
          that.get('mapController').showWorld();
        } else if (that.get('expanded')) {
          that.get('content2').hide();
        } else {


          that.changeChannel('All');
          that.get('sidebarView').displayed = 'Topics-Top';
          that.get('mapController').showWorld();

          //turn off ajax loader
          $('body').children('#loader').hide();


        }

      } 

    });











    //ARROW KEY BEHAVIOR


    var topicsRightArrowObject = {
      'Topics-Top': 'Topics-New',
      'Topics-New': /*'Topics-Hot',
      'Topics-Hot':*/ 'Topics-Top'
    }
    // var topicsLeftArrowObject = {
    //   'Topics-Top': 'Topics-Hot',
    //   'Topics-New': 'Topics-Top',
    //   'Topics-Hot': 'Topics-New'
    // }
    var topicsLeftArrowObject = {
      'Topics-Top': 'Topics-New',
      'Topics-New': 'Topics-Top'
    }

    var loginTopicsRightArrowObject = {
      'Topics-Top': 'Topics-New',
      'Topics-New':/* 'Topics-Hot',
      'Topics-Hot':*/ 'Topics-Contacts',
      'Topics-Contacts': 'Topics-Top'
    }
    var loginTopicsLeftArrowObject = {
      'Topics-Top': 'Topics-Contacts',
      'Topics-New': 'Topics-Top',
      'Topics-Contacts': 'Topics-New',
    }

    var changeColor = function(destination) {
      if (destination === 'Topics-Top') {
        $('#topButton').css('background-color', '#f8f8f8');
        $('#newButton').css('background-color', '#E8E8E8');
        $('#hotButton').css('background-color', '#E8E8E8');
        $('#friendsButton').css('background-color', '#E8E8E8');
      } else if (destination === 'Topics-New') {
        $('#topButton').css('background-color', '#E8E8E8');
        $('#newButton').css('background-color', '#f8f8f8');
        $('#hotButton').css('background-color', '#E8E8E8');
        $('#friendsButton').css('background-color', '#E8E8E8');
      } else if (destination === 'Topics-Hot') {
        $('#topButton').css('background-color', '#E8E8E8');
        $('#newButton').css('background-color', '#E8E8E8');
        $('#hotButton').css('background-color', '#f8f8f8');
        $('#friendsButton').css('background-color', '#E8E8E8');
      } else if (destination === 'Topics-Contacts') {
        $('#topButton').css('background-color', '#E8E8E8');
        $('#newButton').css('background-color', '#E8E8E8');
        $('#hotButton').css('background-color', '#E8E8E8');
        $('#friendsButton').css('background-color', '#f8f8f8');
      }
    };

    //oh god, need to put all the inputs on the site into here ioi
    var inputsArray = ['#searchInput', ];
  
    $(document).keyup(function(e) {

      //check if any of the input boxes or textareas are currently selected
      var flag = false;

      $('input').each(function() {
        if ($(this).is(':focus'))
          flag = true;
      });

      $('textarea').each(function() {
        if ($(this).is(':focus'))
          flag = true;
      });

      if (!flag) {
        
        var x = that.get('sidebarView').displayed;
        if (x === 'Topics-Top' 
          || x === 'Topics-New' 
          || x === 'Topics-Hot' 
          || x === 'Topics-Contacts') {

          if (e.keyCode === 39) {
            if (that.get('login')) {
              that.get('sidebarView').displayed = loginTopicsRightArrowObject[x];
              that.trigger('reloadSidebarTopics');
              changeColor(loginTopicsRightArrowObject[x]);
            } else {
              that.get('sidebarView').displayed = topicsRightArrowObject[x];
              that.trigger('reloadSidebarTopics');
              changeColor(topicsRightArrowObject[x]);
            }
          } else if (e.keyCode === 37) {
            if (that.get('login')) {
              that.get('sidebarView').displayed = loginTopicsLeftArrowObject[x];
              that.trigger('reloadSidebarTopics');
              changeColor(loginTopicsLeftArrowObject[x]);
            } else {
              that.get('sidebarView').displayed = topicsLeftArrowObject[x];
              that.trigger('reloadSidebarTopics');
              changeColor(topicsLeftArrowObject[x]);
            }
          }
        } else if (x === 'Contacts') {
          if (e.keyCode === 39 || e.keyCode === 37) {
            that.get('sidebarView').displayed = 'Messages';
            that.get('content1').show(that.get('sidebarView'));
            $('#messagesButton').css('background-color', '#f8f8f8');
            $('#contactsButton').css('background-color', '#E8E8E8');
          }
        } else if (x === 'Messages') {
          if (e.keyCode === 39 || e.keyCode === 37) {
            that.get('sidebarView').displayed = 'Contacts';
            that.get('content1').show(that.get('sidebarView'));
            $('#messagesButton').css('background-color', '#E8E8E8');
            $('#contactsButton').css('background-color', '#f8f8f8');
          }
        }

      }//end input focus check

    });
  

  



    Backbone.history.start();
    
  },//END CONTROLLER INITIALIZE












  //HERE ARE THE SUBROUTINES THAT WILL MAKE ALL THE CLICKTHROUGH EASIER
  //they all take an argument to specify user/location/channel

  showUserDetailView: function(username) {
    var that = this;

    $.ajax({
      url: 'http://54.202.31.15:80/user',
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
          that.get('detailView').displayed = 'Users';



          //CHECK TO SEE IF THE USERNAME IS THE USER AND GENERATE A RANDOM STRING TO 
          //ATTACH TO THE REQUEST SO THAT WE DON'T CACHE THE IMAGE
          //SO THAT CHANGING A PROFILE PICTURE IS A SEAMLESS EXPERIENCE

          //JUST GOING TO DO THIS FOR NOW, BUT I NEED A SYSTEM
          //SAME SITUATION AS UPVOTES AND EXPAND/CONTRACT

          that.get('content2').show(that.get('detailView'), data[0]);

        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });



  },

  showLocationDetailView: function(location) {
    var that = this;

    $.ajax({
      url: 'http://54.202.31.15:80/location',
      crossDomain: true,
      data: {
        location: location,
      },
      success: function(model) {
        if (model) {

          that.get('detailView').displayed = 'Locations';
          that.get('content2').show(that.get('detailView'), model);

        } else {
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });



  },

  showChannelDetailView: function(channel) {
    var that = this;

    $.ajax({
      url: 'http://54.202.31.15:80/channel',
      crossDomain: true,
      data: {
        channel: channel,
      },
      success: function(model) {
        if (model) {

          console.log('whaaaa');
          that.get('detailView').displayed = 'Channels';
          that.get('content2').show(that.get('detailView'), model);

        } else {
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });

  },










  //sorta like mapController's goToPath()
  //but way easier

  changeChannel: function(channel) {

    this.set('channel', channel);
    this.get('channelView').render();
    this.get('mapController').updateHeatPoints();

  },



  /********************************/
  /******** VALIDATORS ************/
  /********************************/

  inputValidator: function() {

  },

  passwordValidator: function() {

  },



  //accepts one of the english labels and returns
  //its translation in whatever language is
  //currently set
  translate: function(input) {
    
    var lang = this.get('language');

    if (lang !== 'en') {

      for (var i=0; i < translationData.length ;i++) {
        if (translationData[i]['en'] === input) {

          if (translationData[i][lang] !== '') {
            return translationData[i][lang];
          }

        }
      }
      
    } else {
      return input;
    }

  },




















 //  ____            _               __  __                                       
 // |  _ \ ___  __ _(_) ___  _ __   |  \/  | __ _ _ __   __ _  __ _  ___ _ __ ___ 
 // | |_) / _ \/ _` | |/ _ \| '_ \  | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__/ __|
 // |  _ <  __/ (_| | | (_) | | | | | |  | | (_| | | | | (_| | (_| |  __/ |  \__ \
 // |_| \_\___|\__, |_|\___/|_| |_| |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|  |___/
 //            |___/                                          |___/               

 //POPULATE CONTENT1 AND CONTENT2 WITHOUT CREATING ZOMBIES OR DUPLICATING CODE!!!


  RegionManager1: function(id) {
    var currentView;
    var el = id;
    var region = {};
    var that = this;
  
    region.show = function(view) {

      //used by PlacementView to prevent user from breaking out of placement mode
      if (!that.get('mapController').placing) {


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

        //adjust URL
        if (!that.get('expanded')) {
          var location = that.get('mapController').get('location');
          //slice off the 'World/', because 'World' is used as an identifier by the router
          if (location === 'World') {
            that.get('mapController').router.navigate('World#'+that.get('channel'), { trigger:false });
          } else {
            that.get('mapController').router.navigate('World/'+location.slice(6, location.length)+'#'+that.get('channel'), { trigger:false });
          }
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
    region.show = function(view, model, extra) {

      //debugger;


      //if we're showing a topic we have to do some dumb shit apparently
      var renderMethod;

      //i really could just reduce all these Topics-* to one topic display...
      switch (that.get('detailView').displayed) {
        case 'Topics-Top':
          renderMethod = 'renderTopic';
          that.get('mapController').router.navigate('topic/'+model.id, { trigger:false });
          break;
        case 'Topics-New':
          renderMethod = 'renderTopic';
          that.get('mapController').router.navigate('topic/'+model.id, { trigger:false });
          break;
        case 'Topics-Hot':
          renderMethod = 'renderTopic';
          that.get('mapController').router.navigate('topic/'+model.id, { trigger:false });
          break;
        case 'Topics-Contacts':
          renderMethod = 'renderTopic';
          that.get('mapController').router.navigate('topic/'+model.id, { trigger:false });
          break;
        case 'Topics':
          renderMethod = 'renderTopic';
          that.get('mapController').router.navigate('topic/'+model.id, { trigger:false });
          break;
        case 'Messages':
          renderMethod = 'renderMessage';
          break;
        case 'Users':
          renderMethod = 'renderUser';
          that.get('mapController').router.navigate('user/'+model.username, { trigger:false });
          break;
        case 'Contacts':
          renderMethod = 'renderUser';
          break;


          //WTF IS GOING ON HERE
        case 'Locations':
          renderMethod = 'renderLocation';
          if (that.get('mapController').get('location') === 'World') {
            that.get('mapController').router.navigate('location/World', { trigger:false });
          } else {
            that.get('mapController').router.navigate('location/'+model.name, { trigger:false });
          }
          break;
        case 'Channels':
          renderMethod = 'renderChannel';
          if (that.get('channel') === 'All') {
            that.get('mapController').router.navigate('channel/All', { trigger:false });
          } else {
            that.get('mapController').router.navigate('channel/'+model.name, { trigger:false });
          }
          break;


        default:
          renderMethod = 'render';
          break;
      };

      if (currentView && currentView.close) {
        currentView.close();
      }

      //TODO
      $('#content1').css('width', sideWidth+'px');

      currentView = view;
      if (view) {
        view[renderMethod](model, extra);
        $(el).html(view.el);
        if (view.onShow)
          view.onShow();
        if (view.setHandlers)
          view.setHandlers();
      }


      var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
      var sideWidth = $(window).width() - mapWidth;
      $('#content2').css('width', ($(window).width() * 0.75) - sideWidth - 5);

      $('#sidebarContainer').css('-webkit-transition-duration', that.params.transition+'s');

      //this is where content2 changes the size of the sidebarcontainer
      $('#sidebarContainer').css('width', $(window).width() * 0.75);
      that.set('expanded', true);

    };



    region.hide = function() {
      //debugger;
      if (that.get('expanded')) {
        $('#sidebarContainer').css('-webkit-transition-duration', that.params.transition+'s');
        $('#sidebarContainer').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
          //debugger;
        });

        //move this outside of transitionend to fix a bug
        if (currentView && currentView.close) {
          currentView.close();
        }
        currentView = null;
        $('#sidebarContainer').unbind();
        

        
        var mapWidth = $(that.get('mapController').get('map').getContainer()).width();
        var sideWidth = $(window).width() - mapWidth;
        $('#sidebarContainer').css('width', sideWidth+'px');
        that.set('expanded', false);
      } else {
        if (currentView && currentView.close) {
          currentView.close();
        }
        currentView = null;
      }

      //change the URL to non-expanded mode
      var location = that.get('mapController').get('location');
      //slice off the 'World/', because 'World' is used as an identifier by the router
      if (location === 'World') {
        that.get('mapController').router.navigate('World#'+that.get('channel'), { trigger:false });
      } else {
        that.get('mapController').router.navigate('World/'+location.slice(6, location.length)+'#'+that.get('channel'), { trigger:false });
      }


    };

    return region;
  },

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


  //   ____           _            __  __                                   
  //  / ___|__ _  ___| |__   ___  |  \/  | __ _ _ __   __ _  __ _  ___ _ __ 
  // | |   / _` |/ __| '_ \ / _ \ | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
  // | |__| (_| | (__| | | |  __/ | |  | | (_| | | | | (_| | (_| |  __/ |   
  //  \____\__,_|\___|_| |_|\___| |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
  //                                                        |___/           

  //Keep Agora up to date!

  //this.app is used to reference the AppController

  //let's say caching occurs over 15 second (to start, for topics) seconds

  //longer cache for users, places, 

  //if we have the collection in cache, use that instead of making ajax call,
  //unless the time period is up, at which point grab a new one, replace and delete the old one

  
  CacheManager: function(appController) {
    var manager = {};
    manager.app = appController;

    manager.timer = null;
    manager.tokenTimer = null;

    manager.tick = 0;

    manager.topicTreeCollection = [];
    manager.topicsCollection = [];
    manager.messageChainCollection = [];
    manager.messagesCollection = [];


    manager.sentRequests = [];
    manager.contactRequests = [];
    manager.newMessages = [];
    manager.topicActivity = [];


    manager.contacts = [];

    manager.messageTemplate = _.template( $('#detailMessageEntryTemplate').html() );

    manager.start = function() {

      clearInterval(this.timer);
      clearInterval(this.tokenTimer);
      //call getNotifications every ten seconds
      this.timer = setInterval(this.getNotifications.bind(this) , 10000);
      this.tokenTimer = setInterval(this.refreshToken.bind(this), 1000000);


      this.getNotifications();


    };

    manager.stop = function() {

      clearInterval(this.timer);

    };

    manager.getNotifications = function() {
      var that = this;

      //reset credentials every 3 minutes
      this.tick++;
      if (this.tick > 19) {
        this.tick = 0;
        this.updateCredentials();
      }


      $.ajax({
        url: 'https://54.202.31.15:443/notifications',
        // url: 'http://localhost:80/notifications',
        method: 'GET',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: {
          username: that.app.get('username'),
          token: that.app.get('token')
        },
        success: function(data) {

          //contactRequests is an arbitrary choice here
          if (data.contactRequests) {

            console.log('CACHE MANAGER: ', data);

            $('#notificationsButton').css('background-color', 'transparent');
            $('#notificationsAlertOverlay').remove();

            //sentRequests are requests that the user has sent that are pending
            that.sentRequests = data.sentRequests;
            that.contactRequests = data.contactRequests;
            that.newMessages = data.newMessages;
            that.topicActivity = data.topicActivity;

            if (data.contactRequests.length > 0 ||
                data.newMessages.length > 0 ||
                data.topicActivity.length > 0) {

              var count = 0;

              for (var i=0; i < data.newMessages.length ;i++) {
                count++;
              }
              for (var i=0; i < data.contactRequests.length ;i++) {
                count++;
              }
              for (var i=0; i < data.topicActivity.length ;i++) {
                count++;
              }

              if (count < 11) {
                // $('#notificationsButton').append($('<img id="notificationsAlertOverlay" src="resources/images/nIcon'+count+'.png"></img>'));
                $('#notificationsButton').append($('<img id="notificationsAlertOverlay" src="https://s3-us-west-2.amazonaws.com/agora-static-storage/nIcon'+count+'.png"></img>'));
              } else {
                // $('#notificationsButton').append($('<img id="notificationsAlertOverlay" src="resources/images/nIcon11.png"></img>'));
                $('#notificationsButton').append($('<img id="notificationsAlertOverlay" src="https://s3-us-west-2.amazonaws.com/agora-static-storage/nIcon11.png"></img>'));
              }


              var data = data;

              $('#notificationsButton').unbind();

              $('#notificationsButton')[0].onclick = function() {



                  if (!that.app.get('notificationsDisplayed')) {


                      that.app.set('notificationsDisplayed', true);
                      contactRequestTemplate = _.template( $('#contactRequestTemplate').html() );
                      RTLcontactRequestTemplate = _.template( $('#RTLcontactRequestTemplate').html() );
                      newMessageTemplate = _.template( $('#newMessageTemplate').html() );
                      RTLnewMessageTemplate = _.template( $('#RTLnewMessageTemplate').html() );
                      topicActivityTemplate = _.template( $('#topicActivityTemplate').html() );
                      RTLtopicActivityTemplate = _.template( $('#RTLtopicActivityTemplate').html() );




                      //CONTACT REQUESTS


                      var cssAdjust = -75;
                      for (var i=0; i < that.contactRequests.length ;i++) {

                        that.contactRequests[i].contactRequestLabel = that.app.translate('Add contact request from ');
                        var y = that.app.get('language');
                        if ( y === 'ar' || y === 'ja' || y === 'zh') {
                          var $notificationBox = $( RTLcontactRequestTemplate(that.contactRequests[i]) );
                        } else {
                          var $notificationBox = $( contactRequestTemplate(that.contactRequests[i]) );
                        }

                        (function() {

                          var x = that.contactRequests[i].sender;
                          $notificationBox[0].onclick = function() {
                            var thet = this;

                            $.ajax({
                              url: 'http://54.202.31.15:80/user',
                              //url: 'http://localhost:80/user',
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

                                  //is this creating a memory leak????
                                  $(thet).parent().empty();
                                  that.app.set('notificationsDisplayed', false);

                                  that.app.get('content2').show(that.app.get('detailView'), data[0]);
                                } else {
                                  console.log('no data returned from server');
                                }
                              }, error: function(err) {
                                console.log('ajax error ocurred: ', err);
                              }

                            });
                            
      
                          };//end notification click handler


                        })();



                        $('#notificationsDisplay').append($notificationBox);

                        $notificationBox.css('bottom', cssAdjust+'px');
                        cssAdjust -= 50;

                      }



                      //NEW MESSAGES

                      console.log('NEW MESSAGES: ', that.newMessages);

                      for (var i=0; i < that.newMessages.length ;i++) {

                        that.newMessages[i].newMessageLabel = that.app.translate('New message from ');
                        var y = that.app.get('language');
                        if ( y === 'ar' || y === 'ja') {
                          var $notificationBox = $( RTLnewMessageTemplate(that.newMessages[i]) );
                        } else {
                          var $notificationBox = $( newMessageTemplate(that.newMessages[i]) );
                        }


                        (function() {

                          var x = that.newMessages[i].sender;
                          $notificationBox[0].onclick = function() {


                            //OPEN CONVERSATION SUBROUTINE
                            var thet = this;
                            console.log('.sender ', x);

                            var chains = that.app.get('sidebarView').messagesCollection;
                            console.log('chainz: ', chains);
                            var offsetCount = -1;
                            for (var i=0; i < chains.length ;i++) {

                              offsetCount++;

                              if (chains[i].username1 === that.app.get('username')) {
                                chains[i].contact = chains[i].username2;
                              } else {
                                chains[i].contact = chains[i].username1;
                              }

                              //will need to account for pagination here eventually

                              if (chains[i].contact === x) {
                                //open up this shit
                                that.app.get('sidebarView').displayed = 'Messages';
                                that.app.get('detailView').displayed = 'Messages';

                                that.app.get('content1').show(that.app.get('sidebarView'));

                                $.ajax({
                                  url: 'https://54.202.31.15:443/messageChain',
                                  // url: 'http://localhost/messageChain',
                                  method: 'GET',
                                  crossDomain: true,
                                  xhrFields: {
                                    withCredentials: true
                                  },
                                  data: {
                                    username: that.app.get('username'),
                                    contact: chains[i].contact,
                                    token: that.app.get('token')
                                  },
                                  success: function(model) {
                                    //horrible

                                    that.app.get('content2').show(that.app.get('detailView'), model, chains[i].contact);
                                    that.app.get('sidebarView').highlightCell(offsetCount);
                                    //Is this creating a memory leak?
                                    $(thet).parent().empty();
                                    that.app.set('notificationsDisplayed', false);
                                  },
                                  error: function() {
                                    alert(that.app.translate('server error'));
                                  }
                                });
                                break;
                              }

                            }//end chain searching for loop
                            //END OPENING CONVO SUBROUTINE

                          };//end onclick
                          
                        })();

                        $('#notificationsDisplay').append($notificationBox);
                        $notificationBox.css('bottom', cssAdjust+'px');
                        cssAdjust -= 50;

                      }//end new messages for loop









                      //TOPIC ACTIVITY

                      for (var i=0; i < that.topicActivity.length ;i++) {


                        var topicActivityLabel = that.app.translate('New topic activity on /');
                        var topicNumberLabel = that.topicActivity[i].topic;
                        var y = that.app.get('language');
                        if (y === 'ar' || y === 'ja') {
                          var $notificationBox = $( RTLtopicActivityTemplate( {topicActivityLabel: topicActivityLabel, 
                                                                            topicNumberLabel: topicNumberLabel} ) );
                        } else {
                          var $notificationBox = $( topicActivityTemplate( {topicActivityLabel: topicActivityLabel, 
                                                                            topicNumberLabel: topicNumberLabel} ) );
                        }


                        (function() {

                          var model = that.topicActivity[i];

                          $notificationBox[0].onclick = function() {

                            $(this).parent().empty();
                            that.app.set('notificationsDisplayed', false);

                            //∆∆∆∆!!!!!!!!∆∆∆∆∆∆∆
                            //wow this is wayyy simpler than doing all that other shit
                            window.location.href='#topic/'+model.topic;

                            //call to clear topicActivity

                            $.ajax({
                              url: 'https://54.202.31.15:443/clearActivity',
                              // url: 'http://localhost:80/sendContactRequest',
                              method: 'POST',
                              crossDomain: true,
                              xhrFields: {
                                withCredentials: true
                              },
                              data: {
                                username: that.app.get('username'),
                                topicId: model.topic,
                                token: that.app.get('token')
                              },
                              success: function(data) {
                                console.log(data);
                              }, error: function(err) {
                                console.log('ajax error ocurred: ', err);
                              }
                            });

                            
                          };//end entryView click
                          
                        })();


                        console.log($notificationBox);
                        $('#notificationsDisplay').append($notificationBox);

                        $notificationBox.css('bottom', cssAdjust+'px');
                        cssAdjust -= 50;


                      };//end topic activity for loop




                  } else {//notificationsDisplayed check
                    that.app.set('notificationsDisplayed', false);
                    $('#notificationsDisplay').empty();
                  }     

                };//end notification click handler


            }//end if notification

          }/**/ else {
            console.log('data: ', data);
          }

        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    };//end getNotifications




    manager.refreshToken = function() {
      var that = this;


      // $.ajax({
      //   // url: 'http://localhost:80/updateUserProfile',
      //   url: 'https://54.202.31.15:443/refreshToken',
      //   method: 'POST',
      //   crossDomain: true,
      //   xhrFields: {
      //     withCredentials: true
      //   },
      //   data: {
      //     username: that.app.get('username'),
      //     token: that.app.get('token')
      //   },
      //   success: function(data) {
      //     if (data.token) {
      //       that.app.set('token', data.token);
      //     } else {
      //       console.log(data);
      //     }
      //   }, error: function(err) {
      //     console.log('ajax error ocurred: ', err);
      //   }

      // });



    };




    manager.updateCredentials = function() {

    };





    manager.updateMessageChain = function(contact) {

      var that = this;

      $.ajax({
        url: 'https://54.202.31.15:443/messageChain',
        // url: 'http://localhost/messageChain',
        method: 'GET',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: {
          username: that.app.get('username'),
          contact: contact,
          token: that.app.get('token')
        },
        success: function(model) {
          console.log('gettin back: ', model);
          //going to insert directly into the dom here if what we get back
          //does not match what is there

          //have to do this because of detailView bullshit
          //need to remove that shit
          var currentModel = that.app.get('detailView').view.model;
          that.app.get('detailView').view.model = model;



          //this way would be faster if it worked
          // for (var i=model.length-1; i > -1 ;i--) {

          //   console.log('heh');

          //   if (model[i].id !== currentModel[i].id) {

          //     var $message = $('<li></li>').append(this.messageTemplate(this.model[i]))
          //     // $('ul#messageChain').append($message);
          //     $('div#spacer').before($message);
          //     $('ul#messageChain').scrollTop(99999999);


          //     // var $message = $('<li></li>').append(this.template(this.model[i]));
          //     // $messageChainList.prepend($message);
          //   }

          // }



          for (var i=model.length-1; i > -1 ;i--) {

            console.log('heh');

            //woooo using underscore
            if (_.pluck(currentModel, 'id').indexOf(model[i].id) === -1) {

              //console.log('this shit', $('ul#messageChain').children('div#spacer'));
              var $message = $('<li></li>').append(that.messageTemplate(model[i]))
              $('div#spacer').before($message);
              $('ul#messageChain').scrollTop(99999999);

            }

          }






        },
        error: function() {
          alert(that.app.translate('server error'));
        }
      });

    };




    manager.storeTopicTree = function() {

    };

    manager.storeTopicsCollection = function() {
      console.log('adding topics to cache');
    };


    manager.storeMessageChain = function() {

    };

    manager.storeMessagesCollection = function() {

    };



    manager.emptyCache = function() {


      manager.topicTreeCollection = [];
      manager.topicsCollection = [];
      manager.messageChainCollection = [];
      manager.messagesCollection = [];

      manager.sentRequests = [];
      manager.contactRequests = [];
      manager.newMessages = [];
      manager.topicActivity = [];



    };





    return manager;

  }//END CACHE MANAGER CONSTRUCTOR




});




