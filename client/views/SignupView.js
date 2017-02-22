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




    var bigRegisterLabel = this.app.translate('REGISTER');
    var smallRegisterLabel = this.app.translate('Register');
    var usernameLabel = this.app.translate('username');
    var explanationLabel1 = this.app.translate('Your email is never displayed to other users.');
    var explanationLabel2 = this.app.translate('You cannot change origin once it is set!');
    var availabilityLabel = this.app.translate('Check Availability');
    var passwordLabel = this.app.translate('password');
    var confirmPasswordLabel = this.app.translate('confirm password');
    var emailLabel = this.app.translate('email')
    var originLabel = this.app.translate('origin');
    var locationLabel = this.app.translate('current location');
    var aboutLabel = this.app.translate('about');
    var codeLabel = this.app.translate('invite code');


    this.$el.html( this.template({bigRegisterLabel: bigRegisterLabel, explanationLabel1: explanationLabel1,
                                 explanationLabel2: explanationLabel2, smallRegisterLabel: smallRegisterLabel,
                                 availabilityLabel: availabilityLabel }) );



    this.$el.children('#signupCodeInput').attr('placeholder', codeLabel);
    this.$el.children('#signupCodeInput').hide();


    this.$el.children('#signupUsernameInput').attr('placeholder', usernameLabel);
    this.$el.children('#signupPasswordInput').attr('placeholder', passwordLabel);
    this.$el.children('#signupConfirmPasswordInput').attr('placeholder', confirmPasswordLabel);
    this.$el.children('#signupEmailInput').attr('placeholder',emailLabel );
    this.$el.children('#signupOriginInput').attr('placeholder', originLabel);
    this.$el.children('#signupAboutInput').attr('placeholder', aboutLabel);



    this.$el.append();

    this.$el.append($('<img src="https://s3-us-west-2.amazonaws.com/agora-static-storage/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  setHandlers: function() {
    var that = this;



    //Hide the about button, we can use it as a honeypot and i think it just confuses users
    this.$el.children('#signupAboutInput').hide();


    this.$el.children('button#registrationButton').on('click', function() {

          var temp1 = that.app.get('mapController').get('cities');
          var temp2 = that.app.get('mapController').get('countries');
          var temp3 = that.app.get('mapController').get('states');
          var flag1 = false;
           var flag2 = false;
          for (var key in temp1._layers) {
            if (temp1._layers[key].city === $('#signupOriginInput').val()) {
              flag1 = true;
            }
          }
          for (var key2 in temp2._layers) {
            if (temp2._layers[key2].feature.properties.name === $('#signupOriginInput').val()) {
              flag1 = true;
            }
          }
          for (var key3 in temp3._layers) {
            if (temp3._layers[key3].feature.properties.name === $('#signupOriginInput').val()) {
              flag1 = true;
            }
          }
          if ($('#signupOriginInput').val() === 'World') {
            flag1 = true;
          }

          for (var key in temp1._layers) {
            if (temp1._layers[key].city === $('#signupLocationInput').val()) {
              flag2 = true;
            }
          }
          for (var key2 in temp2._layers) {
            if (temp2._layers[key2].feature.properties.name === $('#signupLocationInput').val()) {
              flag2 = true;
            }
          }
          for (var key3 in temp3._layers) {
            if (temp3._layers[key3].feature.properties.name === $('#signupLocationInput').val()) {
              flag2 = true;
            }
          }
          if ($('#signupLocationInput').val() === 'World') {
            flag2 = true;
          }

          if ($('#signupUsernameInput').val() === '') {
            alert(that.app.translate('please enter a username'));
          } else if ($('#signupUsernameInput').val().length > 35) {
            alert(that.app.translate('username must be 35 characters or less'));
          } else if ($('#signupUsernameInput').val().indexOf('@') !== -1) {
            alert(that.app.translate("username may not contain '@'"));
          } else if ($('#signupPasswordInput').val() === '') {
            alert(that.app.translate('please enter a password'));
          } else if ($('#signupPasswordInput').val() !== $('#signupConfirmPasswordInput').val()) {
            alert(that.app.translate('password confirmation does not match'));
          } else if ($('#signupEmailInput').val() === '') {
            alert(that.app.translate('please enter an email'));
          // } else if (!flag1) {
          //   alert(that.app.translate('please enter a valid origin'));
          // } else if (!flag2) {
          //   alert(that.app.translate('please enter a valid current location')); 
          } else if (!$('.g-recaptcha-response').val()) {
            alert(that.app.translate('please complete CAPTCHA'));
          } else {


            $.ajax({

              url: 'http://54.202.31.15:80/registerUser',
              // url: 'https://localhost:443/registerUser',
              method: 'POST',
              //crossDomain: true,
              xhrFields: {
                withCredentials: true
              },
              data: {
                username: $('#signupUsernameInput').val(),
                password: $('#signupPasswordInput').val(),
                origin: $('#signupOriginInput').val(),
                location: $('#signupLocationInput').val(),
                email: $('#signupEmailInput').val(),
                about: $('#signupAboutInput').val(),
                responseString: $('.g-recaptcha-response').val(),
                code: $('#signupCodeInput').val()
              },
              success: function(data) {
                if (data.login) {
                  alert(that.app.translate('registration successful'));
                  that.app.set('token', data.token);

                  that.app.set('login', true);
                  that.app.set('username', $('#signupUsernameInput').val());

                  that.app.get('cacheManager').stop();
                  that.app.get('cacheManager').emptyCache();
                  that.app.get('cacheManager').start();
                  
                  that.app.get('topbarView').render();

                  that.app.trigger('reloadSidebarContacts');
                  that.app.trigger('reloadSidebarMessageChains');

                  that.app.get('mapController').goToPath(data.location);

                  that.app.get('content2').show(new Agora.Views.AboutView(that.app));


                } else {
                  alert(that.app.translate(data));
                  // grecaptcha.reset();
                  grecaptcha.reload_internal('t');
                }

                //log user in
                //show them success screen (introduction/tutorial?)
              },
              error: function(data) {
                alert(that.app.translate(data));
              }

            });
            
          }//end validation if else chain




    });




  

  var $availabilityButton = that.$el.children('button#checkAvailabilityButton');
  $availabilityButton.on('click', function() {


    $.ajax({
      url: 'http://54.202.31.15:80/validateUsername',
      // url: 'http://localhost:80/locationSearch',
      data: {
        username: that.$el.children('input#signupUsernameInput').val()
      },
      crossDomain: true,
      success: function(data) {

        if (data === 'Taken') {
          alert(that.app.translate('username unavailable'));
        } else {
          alert(that.app.translate('username available'));
        }

      },
      error: function(data) {
        console.log('ajax error');
      }
    });



  });

  // var $usernameInput = that.$el.children('input#signupUsernameInput');
  // $usernameInput.on('keyup', function(e) {

  //   var input = $usernameInput.val();

  //   $.ajax({
  //     url: 'http://54.202.31.15:80/checkUsername',
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
  //       console.log('ajax error');
  //     }
  //   });

  // });





    $('#signupOriginInput').on('keyup', function(e) {

      var searchParameter = $('#signupOriginInput').val();

      console.log('searchParameter: ', searchParameter);

      console.log('fjdlska;fdsfjlsajfkldsaf;sajf');

      //SHOULD MAYBE THROTTLE THIS ???????

      if (searchParameter.length > 2) {

        $.ajax({
          url: 'http://54.202.31.15:80/locationSearch',
          // url: 'http://localhost:80/locationSearch',
          data: {
            input: searchParameter
          },
          crossDomain: true,
          success: function(data) {
            console.log(data);
            $('.signupLocationSearchResult').remove();
            $('#signupLocation').show();

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
                  $('#signupLocation').hide();


                });
                
              })();


              $('#signupLocation').append($element);


              
            }

          }
        });

      } else if (searchParameter === '') {
        $('.signupLocationSearchResult').remove();
      }

    });



  $('#signupLocationInput').on('keyup', function(e) {

    var searchParameter = $('#signupLocationInput').val();

    console.log('searchParameter: ', searchParameter);

    //SHOULD MAYBE THROTTLE THIS ???????

    if (searchParameter.length > 2) {

      $.ajax({
        url: 'http://54.202.31.15:80/locationSearch',
        // url: 'http://localhost:80/locationSearch',
        data: {
          input: searchParameter,
        },
        crossDomain: true,
        success: function(data) {
          console.log(data);
          $('.signupLocationSearchResult').remove();
          $('#signupLocation').show();

          var cssAdjust = -30;

          for (var i=0; i < data.length ;i++) {

            var $element = $('<div style="position:relative" class="signupLocationSearchResult">'+data[i].name+'</div>');


            (function() {
              var x = data[i].name;
              $element.on('click', function(e)  {


                console.log('hi');

                // that.app.get('mapController').goToPath(x);
                //that.app.trigger('reloadSidebarTopics', x);

                $('#signupLocationInput').val(x);
                $('.signupLocationSearchResult').remove();
                $('#signupLocation').hide();


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




  $('#signupLocation').hide();





  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});