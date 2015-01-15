window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SignupView = Backbone.View.extend({

  tagName: 'div',

  className: 'signupView',

  initialize: function(appController) {
    this.app = appController;
    console.log('appController', appController);
    this.template = _.template( $('#signupTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.append($('<img src="/resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  setHandlers: function() {
    var that = this;



    this.$el.children('button#registrationButton').on('click', function() {

          var temp1 = that.app.get('mapController').get('cities');
          var temp2 = that.app.get('mapController').get('countries');
          console.log('STUFF: ', temp1, temp2);
          var flag = false;
          for (var i=0; i < temp1.length ;i++) {
            if (temp1._layers[i].city === $('#signupOriginInput').val()) {
              flag = true;
            }
          }
          for (var i=0; i < temp2.length ;i++) {
            if (temp2._layers[i].feature.properties.name === $('#signupOriginInput').val()) {
              flag = true;
            }
          }

          if ($('#signupUsernameInput').val() === '') {
            alert('please enter a username');
          } else if ($('#signupPasswordInput').val() === '') {
            alert('please enter a password');
          } else if ($('#signupEmailInput').val() === '') {
            alert('please enter an email');
          } else if ($('#signupPasswordInput').val() !== $('#signupConfirmPasswordInput').val()) {
            alert('password confirmation does not match');
          } else if (!flag) {
            alert('please enter a valid origin');
          } else {


            $.ajax({

              url: 'https://liveworld.io:443/registerUser',
              // url: 'https://localhost:443/registerUser',
              method: 'POST',
              crossDomain: true,
              xhrFields: {
                withCredentials: true
              },
              data: {
                username: $('#signupUsernameInput').val(),
                password: $('#signupPasswordInput').val(),
                origin: $('#signupOriginInput').val(),
                email: $('#signupEmailInput').val(),
                about: $('#signupAboutInput').val()
              },
              success: function(data) {
                if (data.login) {
                  alert('registration successful');
                  that.app.set('token', data.token);

                  that.app.set('login', true);
                  that.app.set('username', $('#signupUsernameInput').val());

                  that.app.get('cacheManager').stop();
                  that.app.get('cacheManager').emptyCache();
                  that.app.get('cacheManager').start();
                  
                  that.app.get('topbarView').render();
                  that.app.get('content2').hide();

                  that.app.trigger('reloadSidebarContacts');
                  //the last argument suppresses reloading of content1
                  that.app.trigger('reloadSidebarMessageChains');
                } else {
                  alert('registration failed');
                }

                //log user in
                //show them success screen (introduction/tutorial?)
              },
              error: function(data) {
                alert(data);
              }

            });
            
          }//end validation if else chain




    });




  

  var $availabilityButton = that.$el.children('button#checkAvailabilityButton');
  $availabilityButton.on('click', function() {


    $.ajax({
      url: 'http://liveworld.io:80/validateUsername',
      // url: 'http://localhost:80/locationSearch',
      data: {
        username: that.$el.children('input#signupUsernameInput').val()
      },
      crossDomain: true,
      success: function(data) {

        if (data === 'Taken') {
          alert('username unavailable');
        } else {
          alert('username available');
        }

      },
      error: function(data) {
        alert('ajax error');
      }
    });



  });

  // var $usernameInput = that.$el.children('input#signupUsernameInput');
  // $usernameInput.on('keyup', function(e) {

  //   var input = $usernameInput.val();

  //   $.ajax({
  //     url: 'http://liveworld.io:80/checkUsername',
  //     // url: 'http://localhost:80/locationSearch',
  //     data: {
  //       username: input
  //     },
  //     crossDomain: true,
  //     success: function(data) {

  //       if (data === 'Taken') {
  //         console.log('username unavailable');
  //       } else {
  //         console.log('username available');
  //       }

  //     },
  //     error: function(data) {
  //       alert('ajax error');
  //     }
  //   });

  // });





    $('#signupOriginInput').on('keyup', function(e) {

      var searchParameter = $('#signupOriginInput').val();

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

                  $('#signupOriginInput').val(x);
                  $('.signupLocationSearchResult').remove();


                });
                
              })();


              $element.css('bottom', cssAdjust + 'px');

              cssAdjust -= 15;

              $('#signupLocation').append($element);


              
            }

          }
        });

      } else if (searchParameter === '') {
        $('.signupLocationSearchResult').remove();
      }

    });










  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});