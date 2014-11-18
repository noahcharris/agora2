window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.TopbarView = Backbone.View.extend({

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#topbarTemplate').html() );
  },

  render: function() {
    var that = this;

    this.$el.html( this.template(this.model) );

    this.$el.children('span#username')[0].onclick = function() {

      $.ajax({
        url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username')
        },
        success: function(data) {
          if (data) {
            that.app.get('detailView').displayed = 'Users';
            console.log('server returned: ', data);
            that.app.get('content2').show(that.app.get('detailView'), data);
          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    };

    var $registrationButton = $('<img id="registrationButton" class="topbarIcon" src="/resources/images/registration.png" height="20px" width="20px"></img>');
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

    var $settingsButton = $('<img id="settingsButton" class="topbarIcon" src="/resources/images/settings.png" height="20px" width="20px"></img>');
    $('#settingsButton').on('click', function() {
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
    });
    //this.$el.append($settingsButton);


    $('#boundsButton').on('click', function() {
      that.app.get('mapController').logBounds();
    });







    //event listener on the "hello:" is set by locationView

    $('#messagingButton').on('click', function() {

      if (that.app.get('login')) {

        var previousDisplayed = that.app.get('detailView').displayed;

        that.app.get('sidebarView').displayed = 'Messages';
        that.app.get('detailView').displayed = 'Messages';

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

          if (previousDisplayed === 'Messages') {
            that.app.get('content2').hide();
          } else {
           // that.app.get('content2').show(that.app.get('detailView'), that.app.get('sidebarView').messagesCollection[0]);
          }
        }

      } else {
        alert('Must be logged in to view messages');
      }

    });




    $('#notificationsButton').on('click', function() {
      alert('notifications');
    });


    //pressing enter should trigger search

    var searching = false;
    $('#searchButton').on('click', function() {
      // if (!searching) {
      //   searching = true;
      //   $('#searchInput').val('');
      //   that.app.get('alertView').mode = 'Search';
      //   that.app.get('content2').show(that.app.get('alertView'));
      //   //to simulate search time
      //   setTimeout(function() {
      //     //if failed, display the search failed template on alertView

      //     //if successful, load the search results setup
      //     //updated the search collection AND then:
      //     that.app.get('sidebarView').displayed = 'All';
      //     that.app.get('content2').show(that.get('detailView'));
      //     that.app.get('content1').show(that.get('sidebarView'));
      //     searching = false;
      //   },2000);
        
      // }
    });



    $('#title').on('click', function() {
      that.app.get('mapController').showWorld();
    });

    
  }

});
