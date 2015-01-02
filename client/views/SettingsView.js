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
        url: 'http://liveworld.io:80/user',
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
      alert('Location creation coming soon. For now, please send channel creation requests to ...');
      // that.app.get('detailView').displayed = 'CreateLocation';
      // that.app.get('content2').show(new Agora.Views.LocationCreationView(that.app));
    });
    this.$el.append($locationCreationButton);

    var $channelCreationButton = $('<button>Create Channel</button>');
    $channelCreationButton.on('click', function() {
      alert('Channel creation coming soon. For now, please send channel creation requests to ...');
      // that.app.get('detailView').displayed = 'CreateChannel';
      // that.app.get('content2').show(new Agora.Views.ChannelCreationView(that.app));
    });
    this.$el.append($channelCreationButton);


    this.$el.append('<br/><br/>Recently Visited Topics');

    var $recentlyVisted = $('<ul id="recentlyVisted"></ul>');
    this.$el.append($recentlyVisted);

    //get recently visited topics
    $.ajax({
      url: 'https://liveworld.io:443/recentlyVisited',
      // url: 'http://localhost/topicTree',
      method: 'GET',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        username: that.app.get('username'),
        token: that.app.get('token')
      },
      success: function(models) {
        for (var i=0; i < models.length ;i++) {
          console.log(models[i]);

          //add template here

          //put click handler to take user to topic
          //use router here once it is more advanced??

          var $topic = $('<li></li>').append(models[i].headline);

          (function() {

            var model = models[i];

            var x = models[i].channel;
            var y = models[i].location;
            var x = models[i].channel;

            $topic.on('click', function() {

              that.app.set('channel', x);
              that.app.get('mapController').goToPath(y);
              that.app.get('channelView').render();
              console.log('TOPIC: ', model);



              //get specific topic tree from server
              $.ajax({
                url: 'http://liveworld.io:80/topicTree',
                // url: 'http://localhost/topicTree',
                method: 'GET',
                crossDomain: true,
                data: {
                  topicId: model.id
                },
                success: function(model) {
                  that.app.get('detailView').displayed = 'Topics';
                  that.app.get('content2').show(that.app.get('detailView'), model);

                  // thet.$el.addClass('highlight');

                },
                error: function() {
                  alert('ajax error');
                }
              });


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

              // that.app.get('detailView').displayed = 'Topics';
              // that.app.get('content2').show(that.app.get('detailView'), model);
              






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
