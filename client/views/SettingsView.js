window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SettingsView = Backbone.View.extend({

  tagName: 'div',

  className: 'settingsView',

  initialize: function(appController) {
    this.template = _.template( $('#settingsViewTemplate').html() );
    this.app = appController;
    this.$el.addClass('detailView');
    this.subViews = [];
  },

  render: function() {
    var that = this;
    
    this.$el.empty();

    var menuLabel = this.app.translate('Menu');
    var recentlyVisitedLabel = this.app.translate('Recently Visited');
    var viewProfileLabel = this.app.translate('View Profile');
    var editProfileLabel = this.app.translate('Edit Profile');
    var createLocationLabel = this.app.translate('Create Location');
    var createChannelLabel = this.app.translate('Create Channel');
    var changePasswordLabel = this.app.translate('Change Password');
    var changeLocationLabel = this.app.translate('Change Location');
    var changeEmailLabel = this.app.translate('Change Email');
    var inviteCodesLabel = this.app.translate('Invite Codes');
    var twitterLabel = this.app.translate('Link Twitter');

    // TODO - not translated yet
    var resendVerificationLabel = 'Resend Verification Email';


    this.$el.html( this.template( {menuLabel: menuLabel, recentlyVisitedLabel: recentlyVisitedLabel,
      viewProfileLabel: viewProfileLabel, editProfileLabel: editProfileLabel, createLocationLabel: createLocationLabel,
      createChannelLabel: createChannelLabel, changePasswordLabel: changePasswordLabel, changeLocationLabel: changeLocationLabel,
      changeEmailLabel: changeEmailLabel, inviteCodesLabel: inviteCodesLabel, twitterLabel: twitterLabel,
      resendVerificationLabel: resendVerificationLabel } ) );


    this.$el.append($('<img src="https://s3-us-west-2.amazonaws.com/agora-static-storage/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    var $viewProfileButton = this.$el.children('#viewProfileButton');
    $viewProfileButton[0].onclick = function() {
      
      //there is an example in editProfileView
      //that.app.showUserDetailView(that.app.get('username'));

      //THIS ONE ADDS A RANDOM QUERY VARIABLE TO THE REQUEST TO REFRESH THE IMAGE
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




    };

    var $editProfileButton = this.$el.children('#editProfileButton');
    $editProfileButton[0].onclick = function() {
      that.app.get('detailView').displayed = 'Edit Profile';
      that.app.get('content2').show(new Agora.Views.EditProfileView(that.app));
    };

    this.$el.children('#buttonBox').append('<br/>');

    var $locationCreationButton = this.$el.children('#createLocationButton');
    $locationCreationButton.on('click', function() {


      $.ajax({
        url: 'https://egora.co:443/checkVerification',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
          token: that.app.get('token')
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          if (data.length && data[0].verified) {
            that.app.get('detailView').displayed = 'CreateLocation';
            that.app.get('content2').show(new Agora.Views.LocationCreationView(that.app));
          } else {
            alert(that.app.translate('you must verify your email to create a location'));
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    });

    var $channelCreationButton = this.$el.children('#createChannelButton');
    $channelCreationButton.on('click', function() {

      $.ajax({
        url: 'https://egora.co:443/checkVerification',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
          token: that.app.get('token')
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          //s for successsfulllyyyyyy
          if (data.length && data[0].verified) {
            that.app.get('detailView').displayed = 'CreateChannel';
            that.app.get('content2').show(new Agora.Views.ChannelCreationView(that.app));
          } else {
            alert(that.app.translate('you must verify your email to create a channel'));
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    });

    var $changePasswordButton = this.$el.children('#changePasswordButton');
    $changePasswordButton.on('click', function() {
      that.app.get('detailView').displayed = 'ChangePassword';
      that.app.get('content2').show(new Agora.Views.ChangeView(that.app, 'Password'));
    });

    var $changeLocationButton = this.$el.children('#changeLocationButton');
    $changeLocationButton.on('click', function() {
      that.app.get('detailView').displayed = 'ChangeLocation';
      that.app.get('content2').show(new Agora.Views.ChangeView(that.app, 'Location'));
    });

    var $changeEmailButton = this.$el.children('#changeEmailButton');
    $changeEmailButton.on('click', function() {
      that.app.get('detailView').displayed = 'ChangeEmail';
      that.app.get('content2').show(new Agora.Views.ChangeView(that.app, 'Email'));
    });


    var $inviteCodesButton = this.$el.children('#inviteCodesButton');
    $inviteCodesButton.on('click', function() {
      that.app.get('detailView').displayed = 'Invite';
      that.app.get('content2').show(new Agora.Views.InviteView(that.app));
    });

    var $twitterButton = this.$el.children('#twitterButton');
    $twitterButton.on('click', function() {
      that.app.get('detailView').displayed = 'Twitter';
      that.app.get('content2').show(new Agora.Views.TwitterView(that.app));
    });

    var $resendVerificationButton = this.$el.children('#resendVerificationButton');
    $resendVerificationButton.on('click', function() {

      $.ajax({
        url: 'https://egora.co:443/resendVerification',
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
        success: function(data) {

          //TODO - translation
          alert(data.message);

        },
        error: function() {
          console.log('ajax error');
        }
      });


    });










    //get recently visited topics
    $.ajax({
      url: 'https://egora.co:443/recentlyVisited',
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
          entryView.noMouseover = true;
          that.subViews.push(entryView);
          entryView.model = models[i];
          entryView.renderTopic();
          var $listItem = $('<li class="recentlyPostedItem"></li>');
          $listItem.append(entryView.$el);
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
                url: 'http://egora.co:80/topicTree',
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
                  console.log('ajax error');
                }
              });

              //register the topic visit with the server
              $.ajax({
                url: 'https://egora.co:443/visitedTopic',
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
                  console.log('ajax error');
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




        var throttledResize = _.throttle(function() {

                //this is how region manager calculates sidebar width
          

          for (var i=0; i < that.subViews.length ;i++) {
            if (that.subViews[i].model.image) {          
              var box = that.subViews[i].$el.children('.sidebarFloatClear').children('.contentAndToFromWrapper');
              var entryWidth = that.subViews[i].$el.children('.sidebarFloatClear').width();
              box.css('width', (entryWidth - 85) + 'px');
            }

          };

          //THROTTLE TIME (PERHAPS VARY THIS DEPENDING ON USER AGENT??)
        }, 100);


        $(window).on('resize', throttledResize);

        throttledResize();

        //NEED TO UNBIND THIS HANDLER SOMEHOW




      },
      error: function() {
        console.log('ajax error');
      }
    });






  },

  close: function() {
    this.remove();
  }

});
