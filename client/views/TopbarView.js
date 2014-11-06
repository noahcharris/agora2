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

    var $registrationButton = $('<img id="registrationButton" class="topbarIcon" src="/resources/images/registration.png" height="20px" width="20px"></img>');
    $('#registrationButton').on('click', function() {
      that.app.get('detailView').displayed = 'Registration';
      if (!that.app.get('expanded')) {
        that.app.get('content2').show(that.app.get('registrationView'));
      } else {
        if ($('#content2').children()[0].className === 'registrationView detailView') {
          that.app.get('content2').hide();
        } else {
          that.app.get('content2').show(that.app.get('registrationView'));
        }
      }
    });
    //this.$el.append($registrationButton);

    var $settingsButton = $('<img id="settingsButton" class="topbarIcon" src="/resources/images/settings.png" height="20px" width="20px"></img>');
    $('#settingsButton').on('click', function() {
      that.app.get('detailView').displayed = 'Settings';
      if (!that.app.get('expanded')) {
        that.app.get('content2').show(that.app.get('settingsView'));
      } else {
        //this doesn't work
        if ($('#content2').children()[0].className === 'settingsView detailView') {
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




    //event listener on the "hello:" is set by pathView

    $('#messagingButton').on('click', function() {
      that.app.get('sidebarView').displayed = 'Messages';
      that.app.get('detailView').displayed = 'Messages';

      //set messagesCollection?
      // that.app.get('sidebarView').collection.models = that.app.messagesCollection;
      // console.log(that.app.get('sidebarView').collection.models);
      
      that.app.get('content1').show(that.app.get('sidebarView'));
      if (!that.app.get('expanded')) {
        that.app.get('content2').show(that.app.get('detailView'));
      } else {
        // TODO

        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //guess i need to change this classname?
        if ($('#content2').children()[0].className === 'fjkdla;fajlk') {
          that.app.get('content2').hide();
        } else {
          that.app.get('content2').show(that.app.get('detailView'));
        }
      }
    });

    $('#notificationsButton').on('click', function() {
      alert('notifications');
    });


    //pressing enter should trigger search

    //LEAVING OUT SEARCH RIGHT NOW

    // var searching = false;
    // $('#searchButton').on('click', function() {
    //   if (!searching) {
    //     searching = true;
    //     $('#searchInput').val('');
    //     that.app.get('alertView').mode = 'Search';
    //     that.app.get('content2').show(that.app.get('alertView'));
    //     //to simulate search time
    //     setTimeout(function() {
    //       //if failed, display the search failed template on alertView

    //       //if successful, load the search results setup
    //       //updated the search collection AND then:
    //       that.app.get('sidebarView').displayed = 'All';
    //       that.app.get('content2').show(that.get('detailView'));
    //       that.app.get('content1').show(that.get('sidebarView'));
    //       searching = false;
    //     },2000);
        
    //   }
    // });


    $('#title').on('click', function() {
      that.app.get('mapController').showWorld();
    });

    
  }

});
