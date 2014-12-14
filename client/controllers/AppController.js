window.Agora = window.Agora || {};
window.Agora.Controllers = window.Agora.Controllers || {};

Agora.Controllers.AppController = Backbone.Model.extend({

  defaults: {
    mobile: false,
  },



  initialize: function() {

    var that = this;

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

    this.set('cacheTimer', null);


    this.set('username', 'noah'); //is this secure???


    this.set('login', true);

    this.set('token', null); //this is where we store token for csrf protection



    var cacheManager = this.CacheManager(this);
    this.set('cacheManager', cacheManager);

    //not logged in initially
    //BUT NEED TO ASK SERVER HERE WHETHER WE ARE OR NOT
    $.ajax({
      url: 'http://54.149.63.77:80/checkLogin',
      //url: 'http://localhost:80' + urlPath,
      crossDomain: true,
      method: 'GET',
      data: {
      },
      success: function(data) {
        if (data.login) {

          //login subroutine
          that.get('topbarView').model.user = data.username;
          that.get('topbarView').render();
          that.set('token', data.token);
          that.set('login', true);
          that.set('username', data.username);

          that.get('cacheManager').start();


        } else {
          console.log('no session detected');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });








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
    //used by detailChannelView
    this.set('channelView', channelView);
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

    //takes page for pagination of topics

    //THIS TAKES AN 'EXTRA' TOPIC WHICH IS UNSHIFTED INTO THE TOPICSCOLLECTION
    //THIS IS FOR SEARCH & 'RECENTLY VISITED'
    this.on('reloadSidebarTopics', function(location, extra) { 

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
        url: 'http://54.149.63.77:80' + urlPath,
        //url: 'ec2-54-149-63-77.us-west-2.compute.amazonaws.com:80' + urlPath,
        //url: 'http://localhost:80' + urlPath,
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


            sidebarView.collection = data;
            //add extra if it's not already there
            if (extra && _.pluck(data, 'id').indexOf(extra.id) === -1)
              sidebarView.collection.unshift(extra);
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
        url: 'http://54.149.63.77:80/contacts',
        //url: 'http://localhost:80/contacts',
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
        url: 'http://54.149.63.77:80/messages',
        //url: 'http://localhost:80/messages',
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




    //NEED TO LOAD HERE NOW CAUSE ROUTER NO LONGER DOES IT
    this.trigger('reloadSidebarTopics', 'World');





    $.ajax({
      url: 'https://54.149.63.77:443/test',
      crossDomain: true,
      method: 'GET',
      data: {
      },
      success: function(data) {
        if (data) {
          topicsCollection = data;
          console.log('server returned: ', data);
          //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
          // sidebarView.collection = data;
          // content1.show(sidebarView); 
        } else {
          // console.log('memcached returned false');
          // sidebarView.collection = defaultCollection;
          // content1.show(sidebarView);
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });





    var $body = $('body');

    console.log('what you need: ', $body.children('#loader'));

    $body.children('#loader').hide();

    $(document).on({

        ajaxStart: function() { 

          $body.children('#loader').show();  

        },

        ajaxStop: function() { 

          $body.children('#loader').hide();

        }    

    });



    
  },//END CONTROLLER INITIALIZE




  //sorta like mapController's goToPath()
  //but way easier

  changeChannel: function(channel) {

    this.set('channel', channel);
    this.trigger('reloadSidebarTopics', this.get('mapController').get('location'));
    this.get('channelView').render();
    console.log('changing channel');

  },



  /********************************/
  /******** VALIDATORS ************/
  /********************************/

  inputValidator: function() {

  },

  passwordValidator: function() {

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
    region.show = function(view, model, extra) {


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
        case 'Locations':
          renderMethod = 'renderLocation';
          break;
        case 'Channels':
          renderMethod = 'renderChannel';
          break;
        default:
          renderMethod = 'render';
          break;
      };

      console.log('render method: ', renderMethod);

      if (currentView && currentView.close) {
        currentView.close();
      }

      //TODO
      $('#content1').css('width', sideWidth+'px');

      currentView = view;
      if (view) {
        //MODEL 2 FUUUUCCKKCKCKCKCK
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

    manager.timer = null;

    manager.tick = 0;

    manager.topicTreeCollection = [];
    manager.topicsCollection = [];
    manager.messageChainCollection = [];
    manager.messagesCollection = [];

    manager.messageTemplate = _.template( $('#detailMessageEntryTemplate').html() );

    manager.start = function() {

      clearInterval(this.timer);
      //call getNotifications every ten seconds
      this.timer = setInterval(this.getNotifications.bind(this) , 10000);

      this.getNotifications();


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
        url: 'http://54.149.63.77:80/notifications',
        // url: 'http://localhost:80/notifications',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username')
        },
        success: function(data) {

            console.log('CACHE MANAGER');
            console.log('server returned: ', data);

            $('#notificationsButton').css('background-color', 'green');

            if (data.contactRequests.length > 0 ||
                data.newMessages.length > 0 ||
                data.topicActivity.length > 0) {

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
                        url: 'http://54.149.63.77:80/user',
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

                  console.log('what');

                  $('#notificationsButton').css('background-color', 'red');

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


              };//end notification click handler

            }//end if (data)

        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    };//end getNotifications


    manager.updateCredentials = function() {

    };





    manager.updateMessageChain = function(contact) {

      var that = this;

      $.ajax({
        url: 'http://54.149.63.77:80/messageChain',
        // url: 'http://localhost/messageChain',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
          contact: contact
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
          alert('server error');
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





    return manager;

  }




});




