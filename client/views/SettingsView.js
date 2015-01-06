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
      
      //there is an example in editProfileView
      //that.app.showUserDetailView(that.app.get('username'));

      //THIS ONE ADDS A RANDOM QUERY VARIABLE TO THE REQUEST TO REFRESH THE IMAGE
      $.ajax({
        url: 'http://liveworld.io:80/user',
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




    };
    this.$el.children('#buttonBox').append($viewProfileButton);

    var $editProfileButton = $('<button>Edit My Profile</button>');
    $editProfileButton[0].onclick = function() {
      that.app.get('detailView').displayed = 'Edit Profile';
      that.app.get('content2').show(new Agora.Views.EditProfileView(that.app));
    };
    this.$el.children('#buttonBox').append($editProfileButton);
    this.$el.children('#buttonBox').append('<br/>');

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
      // that.app.get('detailView').displayed = 'CreateLocation';
      // that.app.get('content2').show(new Agora.Views.LocationCreationView(that.app));
    });
    this.$el.children('#buttonBox').append($locationCreationButton);

    var $channelCreationButton = $('<button>Create Channel</button>');
    $channelCreationButton.on('click', function() {
      that.app.get('detailView').displayed = 'CreateChannel';
      that.app.get('content2').show(new Agora.Views.ChannelCreationView(that.app));
    });
    this.$el.children('#buttonBox').append($channelCreationButton);


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


          var entryView = new Agora.Views.SidebarEntryView(that.app);
          entryView.model = models[i];
          entryView.renderTopic();
          var $listItem = $('<li class="recentlyPostedItem"></li>');
          $listItem.append(entryView.$el);
          console.log($listItem);
          console.log($('#recentlyVisted'));
          $('#recentlyVisited').append($listItem);

          (function() {

            var model = models[i];

            var x = models[i].channel;
            var y = models[i].location;

            entryView.on('click', function() {

              that.app.set('channel', x);
              that.app.get('mapController').goToPath(y);
              that.app.get('channelView').render();

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

              //register the topic visit with the server
              $.ajax({
                url: 'https://liveworld.io:443/visitedTopic',
                // url: 'http://localhost/topicTree',
                method: 'POST',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true
                },
                data: {
                  username: that.app.get('username'),
                  token: that.app.get('token'),
                  //WHY IS THIS A STRING????
                  topicId: model.id
                },
                success: function(data) {
                  //alert(data);
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
              


            });//end entryView click
            
          })();

        }//end models for loop
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
