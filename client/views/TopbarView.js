window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.TopbarView = Backbone.View.extend({

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#topbarTemplate').html() );
  },

  render: function() {
    var that = this;

    var noUserPrefix = this.app.translate('Not Logged In');

    var username = that.app.get('username') || noUserPrefix;

    this.$el.html( this.template({ username: username }) );

    //set the select to appropriate language
    var temp;
    switch (this.app.get('language')) {
      case 'ar':
        temp = 'Arabic';
        break;
      case 'zh':
        temp = 'Chinese';
        break;
      case 'en':
        temp = 'English';
        break;
      case 'fr':
        temp = 'French';
        break;
      case 'de':
        temp = 'German';
        break;
      case 'ja':
        temp = 'Japanese';
        break;
      case 'pt':
        temp = 'Portuguese';
        break;
      case 'ru':
        temp = 'Russian';
        break;
      case 'es':
        temp = 'Spanish';
        break;
      default:
        temp = 'English';
        break;
    }
    $('#languageSelect').val(temp);

    //TRANSLATION
    var userOptionsLabel = this.app.translate('Users');
    var locationOptionsLabel = this.app.translate('Locations');
    var channelOptionsLabel = this.app.translate('Channels');
    this.$el.children('#searchSelect').children('#userOption')[0].label = userOptionsLabel;
    this.$el.children('#searchSelect').children('#locationOption')[0].label = locationOptionsLabel;
    this.$el.children('#searchSelect').children('#channelOption')[0].label = channelOptionsLabel;


    this.$el.children('span#username')[0].onclick = function() {

      //that.app.showUserDetailView(that.app.get('username'));

      if (!that.app.get('username')) {
        alert(that.app.translate('you must log in to view your profile'));
      } else {
        
        $.ajax({
          url: 'http://egora.co:80/user',
          // url: 'http://localhost:80/user',
          method: 'GET',
          crossDomain: true,
          data: {
            username: that.app.get('username'),
            //so that this is never cached
            extra: Math.floor((Math.random() * 10000) + 1)
          },
          success: function(data) {
            if (data[0]) {
              that.app.get('detailView').displayed = 'Users';
              console.log('server returned: ', data);


              //CHECK TO SEE IF THE USERNAME IS THE USER AND GENERATE A RANDOM STRING TO 
              //ATTACH TO THE REQUEST SO THAT WE DON'T CACHE THE IMAGE
              //SO THAT CHANGING A PROFILE PICTURE IS A SEAMLESS EXPERIENCE

              //JUST GOING TO DO THIS FOR NOW, BUT I NEED A SYSTEM
              //SAME SITUATION AS UPVOTES AND EXPAND/CONTRACT

              data[0].isContact = true;
              that.app.get('content2').show(that.app.get('detailView'), data[0]);

            } else {
              console.log('no data returned from server');
            }
          }, error: function(err) {
            console.log('ajax error ocurred: ', err);
          }

        });
        
      }


    };

    //var $registrationButton = $('<img id="registrationButton" class="topbarIcon" src="/resources/images/registration.png" height="20px" width="20px"></img>');
    $('#registrationButton').on('click', function() {
      var previousDisplayed = that.app.get('detailView').displayed;
      that.app.get('detailView').displayed = 'Registration';
      if (!that.app.get('expanded')) {
        that.app.get('content2').show(that.app.get('registrationView'));
      } else {
        if (previousDisplayed === 'Registration') {
          that.app.get('content2').hide();
        } else {
          that.app.get('content2').show(that.app.get('registrationView'));
        }
      }
    });
    //this.$el.append($registrationButton);

    //var $settingsButton = $('<img id="settingsButton" class="topbarIcon" src="/resources/images/settings.png" height="20px" width="20px"></img>');
    $('#settingsButton').on('click', function() {

      if (that.app.get('login')) {
        
        var previousDisplayed = that.app.get('detailView').displayed;
        that.app.get('detailView').displayed = 'Settings';
        if (!that.app.get('expanded')) {
          that.app.get('content2').show(that.app.get('settingsView'));
        } else {
          //this doesn't work
          console.log(that.app.get('detailView').displayed);
          if (previousDisplayed === 'Settings') {
            that.app.get('content2').hide();
          } else {
            that.app.get('content2').show(that.app.get('settingsView'));
          }
        }

      } else {
        alert(that.app.translate('you must be logged in to access settings'));
      }
    });
    //this.$el.append($settingsButton);


    $('#boundsButton').on('click', function() {
      that.app.get('mapController').logBounds();
    });





    $('#aboutButton').on('click', function() {
        
        var previousDisplayed = that.app.get('detailView').displayed;
        that.app.get('detailView').displayed = 'About';
        if (!that.app.get('expanded')) {
          that.app.get('content2').show(new Agora.Views.AboutView(that.app));
        } else {
          //this doesn't work
          console.log(that.app.get('detailView').displayed);
          if (previousDisplayed === 'About') {
            that.app.get('content2').hide();
          } else {
            that.app.get('content2').show(new Agora.Views.AboutView(that.app));
          }
        }

    });




    //event listener on the "hello:" is set by locationView

    $('#messagingButton').on('click', function() {

      if (that.app.get('login')) {

        var previousDisplayed = that.app.get('detailView').displayed;

        that.app.get('sidebarView').displayed = 'Contacts';
        that.app.get('detailView').displayed = 'Contacts';

        that.app.trigger('reloadSidebarContacts');
        that.app.trigger('reloadSidebarMessageChains');


        //WHAT SORT OF BEHAVIOR SHOULD THIS HAVE, OPEN ON SELECT?? BUT PEOPLE LIKE PRIVACY WHEN IT COMES
        //TO MESSAGES IDK


        //set messagesCollection?
        // that.app.get('sidebarView').collection.models = that.app.messagesCollection;
        // console.log(that.app.get('sidebarView').collection.models);

        that.app.get('content1').show(that.app.get('sidebarView'));

        if (!that.app.get('expanded')) {
          //don't show the detail view on clicking the message button
          //that.app.get('content2').show(that.app.get('detailView'), that.app.get('sidebarView').messagesCollection[0]);
        } else {

          if (previousDisplayed === 'Messages'
           || previousDisplayed === 'Contacts') {
            that.app.get('content2').hide();
          } else {
           // that.app.get('content2').show(that.app.get('detailView'), that.app.get('sidebarView').messagesCollection[0]);
          }
        }

      } else {
        alert(that.app.translate('you must be logged in to view messages'));
      }

    });


    //this actually gets set in cache manager right now
    $('#notificationsButton').on('click', function() {

    });


    //pressing enter should trigger search

    var searchHandler = function() {

      console.log('whyyyyyyyy');

        switch ($('#searchSelect').val()) {
          case 'Users':
            urlSuffix = 'userSearch';
            break;
          case 'Locations':
            urlSuffix = 'locationSearch'
            break;
          case 'Channels':
            urlSuffix = 'channelSearch'
            break;
          default:
            urlSuffix = 'userSearch';
            break;
        }

        $.ajax({
          url: 'http://egora.co:80/' + urlSuffix,
          // url: 'http://localhost:80/' + urlSuffix,
          method: 'GET',
          crossDomain: true,
          data: {
            input: $('#searchInput').val()
          },
          success: function(data) {
            if (data) {
              that.app.get('sidebarView').searchCollection = data;
              that.app.get('sidebarView').displayed = 'Search';
              content1.show(that.app.get('sidebarView'));
            } else {
              alert(that.app.translate('search returned no data'));
            }
          }, error: function(err) {
            console.log('ajax error ocurred: ', err);
          }

        });

    }





    $(document).keypress(function(e) {

      console.log('fdjsaklf');
      if (e.keyCode === 13 && that.$el.children('#searchInput').is(':focus')) {

        searchHandler();


      }

    });

    $('#searchButton').on('click', function() {
      searchHandler();
    });






    //STATIC TRANSLATION
    $('#languageSelect').on('change', function() {

      console.log($('#languageSelect').val());
      var temp = 'en';
      switch ($('#languageSelect').val()) {
        case 'Arabic':
          temp = 'ar';
          break;
        case 'Chinese':
          temp = 'zh';
          break;
        case 'English':
          temp = 'en';
          break;
        case 'French':
          temp = 'fr';
          break;
        case 'German':
          temp = 'de';
          break;
        case 'Japanese':
          temp = 'ja';
          break;
        case 'Portuguese':
          temp = 'pt';
          break;
        case 'Russian':
          temp = 'ru';
          break;
        case 'Spanish':
          temp = 'es';
          break;
        default:
          temp = 'en';
          break;
      }
      that.app.set('language', temp);

      that.app.get('topbarView').render();
      that.app.get('cacheManager').getNotifications();
      that.app.get('locationView').render();
      that.app.get('channelView').render();
      that.app.get('sidebarView').render();
      that.app.get('sidebarView').setHandlers();

      //later on include content2 as well
      that.app.get('content2').hide();

    });


    //TODO about icon handler
    // function() {
    //   var aboutView = new Agora.Views.AboutView(that);
    //   that.app.get('detailView').displayed = 'About';
    //   that.app.get('content2').show(aboutView);
    // }




    $('#title').on('click', function() {
      that.app.changeChannel('All');
      that.app.get('sidebarView').page = 1;
      //that.app.get('mapController').showWorld();

      //had to do a custom version of show world which doesn't close content2
      var southWest = L.latLng(-67.474922384787, -153.984375);
      var northEast = L.latLng(79.36770077764092, 162.421875);
      var worldBounds = L.latLngBounds(southWest, northEast);

      // !! to break out of anything that's not topics or groups mode
      if (that.app.get('sidebarView').displayed !== 'Topics-Top'
        && that.app.get('sidebarView').displayed !== 'Topics-New'
        && that.app.get('sidebarView').displayed !== 'Topics-Hot') {
        that.app.get('sidebarView').displayed = 'Topics-Top';
      }

      that.app.get('mapController').get('map').fitBounds(worldBounds);
      that.app.get('mapController').set('location', 'World');   //location is set to '' for world, which is automatically added by locationview
      that.app.get('locationView').render();

      that.app.get('mapController').router.navigate('World#'+that.app.get('channel'), { trigger:false });

      //this.app.get('content2').hide();
      that.app.trigger('reloadSidebarTopics', 'World');


    });

    
  }

});
