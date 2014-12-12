window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SettingsView = Backbone.View.extend({

  tagName: 'div',

  className: 'settingsView',

  initialize: function(appController) {
    this.template = _.template( $('#settingsViewTemplate').html() );
    this.app = appController;
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;
    
    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    var $viewProfileButton = $('<button>View My Profile</button>');
    $viewProfileButton[0].onclick = function() {
      console.log('hi');
      $.ajax({
        url: 'http://54.149.63.77:80/user',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username')
        },
        success: function(data) {
          if (data) {
            that.app.get('detailView').displayed = 'Users';
            console.log('server returned: ', data);
            that.app.get('content2').show(that.app.get('detailView'), data[0]);
          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }
      });
    };
    this.$el.append($viewProfileButton);

    var $editProfileButton = $('<button>Edit My Profile</button>');
    $editProfileButton[0].onclick = function() {
      that.app.get('detailView').displayed = 'Edit Profile';
      that.app.get('content2').show(new Agora.Views.EditProfileView(that.app));
    };
    this.$el.append($editProfileButton);
    this.$el.append('<br/>');

    var $changeLocationButton = $('<button>Change Location</button>');
    $changeLocationButton[0].onclick = function() {

    };
    //this.$el.append($changeLocationButton);

    var $changePasswordButton = $('<button>Change Password</button>');
    $changePasswordButton[0].onclick = function() {

    };
    //this.$el.append($changePasswordButton);


    var $locationCreationButton = $('<button>Create Location</button>');
    $locationCreationButton.on('click', function() {
      that.app.get('detailView').displayed = 'CreateLocation';
      that.app.get('content2').show(new Agora.Views.LocationCreationView(that.app));
    });
    this.$el.append($locationCreationButton);

    var $channelCreationButton = $('<button>Create Channel</button>');
    $channelCreationButton.on('click', function() {
      that.app.get('detailView').displayed = 'CreateChannel';
      that.app.get('content2').show(new Agora.Views.ChannelCreationView(that.app));
    });
    this.$el.append($channelCreationButton);


    this.$el.append('<br/><br/>Recently Visited Topics');

    var $recentlyVisted = $('<ul id="recentlyVisted"></ul>');
    this.$el.append($recentlyVisted);

    //get recently visited topics
    $.ajax({
      url: 'http://54.149.63.77:80/recentlyVisited',
      // url: 'http://localhost/topicTree',
      method: 'GET',
      data: {
        username: that.app.get('username'),
      },
      success: function(models) {
        for (var i=0; i < models.length ;i++) {
          console.log(models[i].contents);

          //add template here

          //put click handler to take user to topic
          //use router here once it is more advanced??

          var $topic = $('<li></li>').append(models[i].headline);

          (function() {

            var x = models[i].channel;
            var y = models[i].location;
            var x = models[i].channel;

            $topic.on('click', function() {

              that.app.set('channel', x);
              that.app.get('mapController').goToPath(y);
              that.app.get('channelView').render();  

            });
            
          })();



          $('ul#recentlyVisted').append($topic)
        }
      },
      error: function() {
        alert('ajax error');
      }
    });






  },

  close: function() {
    console.log('settingsviewclosing');
    this.remove();
  }

});
