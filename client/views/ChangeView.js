window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.ChangeView = Backbone.View.extend({

  tagName: 'div',

  className: 'changeView',

  initialize: function(appController, mode) {
    this.app = appController;
    console.log('appController', appController);
    this.template = _.template( $('#changeViewTemplate').html() );
    this.$el.addClass('detailView');
    this.mode = mode;
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.append($('<img src="/resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });








    if (this.mode === 'Password') {









      this.$el.append('CHANGE PASSWORD');
      this.$el.append($('<br/><input id="changePasswordInputOne" type="password" placeholder="Current Password" type="text"></input><br/>'));
      this.$el.append($('<br/><input id="changePasswordInputTwo" type="password" placeholder="New Password" type="text"></input><br/>'));
      this.$el.append($('<br/><input id="changePasswordInputThree" type="password" placeholder="Confirm New Password" type="text"></input><br/>'));

      var $changePasswordDoneButton = $('<button id="changePasswordDoneButton">Done!</button>');
      $changePasswordDoneButton.on('click', function() {
        var pass2 = that.$el.children('#changePasswordInputTwo').val();
        var pass3 = that.$el.children('#changePasswordInputThree').val();


        if (pass2 !== pass3) {
          alert('password confirmation does not match');
        } else {
          
          $.ajax({
            url: 'https://liveworld.io:443/changePassword',
            // url: 'http://localhost:80/user',
            method: 'POST',
            crossDomain: true,
            data: {
              username: that.app.get('username'),
              token: that.app.get('token'),
              password: that.$el.children('#changePasswordInputOne').val(),
              newPassword: that.$el.children('#changePasswordInputTwo').val()
            },
            xhrFields: {
              withCredentials: true
            },
            success: function(data) {
              //s for successsfulllyyyyyy
              if (data[0] === 's') {
                alert('success!');
                that.app.get('detailView').displayed = 'Settings';
                that.app.get('content2').show(that.app.get('settingsView'));
              } else {
                alert(data);
              }
            }, error: function(err) {
              console.log('ajax error ocurred: ', err);
            }

          });

        }

      });
      this.$el.append($changePasswordDoneButton);

      var $backButton = $('<button id="backButton">Back</button>')
      $backButton.on('click', function() {
        that.app.get('detailView').displayed = 'Settings';
        that.app.get('content2').show(that.app.get('settingsView'));
      });
      this.$el.append($backButton);







    } else if (this.mode === 'Location') {





      //load current location in
      var $changeLocationInput = $('<br/><input id="changeLocationInput" type="text"></input><br/>');
      this.$el.append($changeLocationInput);
      var $changeLocationDoneButton = $('<button id="changeLocationDoneButton">Done!</button>');
      this.$el.append($changeLocationDoneButton);

      $.ajax({
        url: 'http://liveworld.io:80/user',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          if (data.length) {
            that.$el.children('#changeLocationInput').val(data[0].location);

          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

      $changeLocationDoneButton.on('click', function() {

        $.ajax({
          url: 'https://liveworld.io:443/changeLocation',
          // url: 'http://localhost:80/user',
          method: 'POST',
          crossDomain: true,
          data: {
            username: that.app.get('username'),
            token: that.app.get('token'),
            location: that.$el.children('#changeLocationInput').val()
          },
          xhrFields: {
            withCredentials: true
          },
          success: function(data) {
            if (data[0] === 's') {
              alert('success!');
              that.app.get('detailView').displayed = 'Settings';
              that.app.get('content2').show(that.app.get('settingsView'));
            } else {
              alert(data);
            }
          }, error: function(err) {
            console.log('ajax error ocurred: ', err);
          }

        });


      });



      that.$el.children('#changeLocationInput').on('keyup', function(e) {

        var searchParameter = that.$el.children('#changeLocationInput').val();
        console.log('searchParameter: ', searchParameter);

        //SHOULD MAYBE THROTTLE THIS ???????
        if (searchParameter.length > 2) {

          $.ajax({
            url: 'http://liveworld.io:80/locationSearch',
            // url: 'http://localhost:80/locationSearch',
            data: {
              input: searchParameter
            },
            crossDomain: true,
            success: function(data) {
              console.log(data);
              $('.signupLocationSearchResult').remove();

              var cssAdjust = -30;

              for (var i=0; i < data.length ;i++) {

                var $element = $('<div style="position:relative" class="signupLocationSearchResult">'+data[i].name+'</div>');

                (function() {
                  var x = data[i].name;
                  $element.on('click', function(e)  {

                    console.log('hi');

                    // that.app.get('mapController').goToPath(x);
                    //that.app.trigger('reloadSidebarTopics', x);

                    that.$el.children('#changeLocationInput').val(x);
                    $('.signupLocationSearchResult').remove();

                  });
                  
                })();

                $element.css('bottom', cssAdjust + 'px');

                cssAdjust -= 15;

                that.$el.append($element);

              }

            }
          });

        } else if (searchParameter === '') {
          $('.signupLocationSearchResult').remove();
        }

      });

      var $backButton = $('<button id="backButton">Back</button>')
      $backButton.on('click', function() {
        that.app.get('detailView').displayed = 'Settings';
        that.app.get('content2').show(that.app.get('settingsView'));
      });
      this.$el.append($backButton);










    } else if (this.mode === 'Email') {











      this.$el.append('CHANGE EMAIL');
      //load current email in

      $.ajax({
        url: 'https://liveworld.io:443/userEmail',
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
          if (data.length) {
            console.log('server returned: ', data);

            that.$el.children('#changeEmailInputTwo').val(data[0].email);

          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


      this.$el.append($('<br/><input id="changeEmailInputOne" type="password" placeholder="Password" type="text"></input><br/>'));
      this.$el.append($('<br/><input id="changeEmailInputTwo" type="text"></input><br/>'));
      var $changeEmailDoneButton = $('<button id="changeEmailDoneButton">Done!</button>');
      $changeEmailDoneButton.on('click', function() {


        $.ajax({
          url: 'https://liveworld.io:443/changeEmail',
          // url: 'http://localhost:80/user',
          method: 'POST',
          crossDomain: true,
          data: {
            username: that.app.get('username'),
            token: that.app.get('token'),
            email: that.$el.children('#changeEmailInputTwo').val(),
            password: that.$el.children('#changeEmailInputOne').val()
          },
          xhrFields: {
            withCredentials: true
          },
          success: function(data) {
            //s for successsfulllyyyyyy
            if (data[0] === 's') {
              alert('success!');
              that.app.get('detailView').displayed = 'Settings';
              that.app.get('content2').show(that.app.get('settingsView'));
            } else {
              alert(data);
            }
          }, error: function(err) {
            console.log('ajax error ocurred: ', err);
          }

        });



      });
      this.$el.append($changeEmailDoneButton);

      var $backButton = $('<button id="backButton">Back</button>')
      $backButton.on('click', function() {
        that.app.get('detailView').displayed = 'Settings';
        that.app.get('content2').show(that.app.get('settingsView'));
      });
      this.$el.append($backButton);



    }

  },











  

  setHandlers: function() {


  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});