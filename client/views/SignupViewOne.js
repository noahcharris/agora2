window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SignupViewOne = Backbone.View.extend({

  tagName: 'div',

  className: 'signupViewOne',

  initialize: function(appController) {
    this.app = appController;
    console.log('appController', appController);
    this.template = _.template( $('#signupOneTemplate').html() );
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
    this.$el.children('button').on('click', function() {

          $.ajax({

            url: 'http://54.69.226.228:80/registerUser',
            // url: 'https://localhost:443/registerUser',
            method: 'POST',
            crossDomain: true,
            data: {
              username: $('#signupUsernameInput').val(),
              password: $('#signupPasswordInput').val(),
              origin: $('#signupOriginInput').val(),
              email: $('#signupEmailInput').val(),
              about: $('#signupAboutInput').val()
            },
            success: function(data) {
              alert(data);
              that.app.set('login', true);
              that.app.set('username', $('#signupUsernameInput').val());
              that.app.get('topbarView').render();

              that.app.get('content2').hide();

              that.app.trigger('reloadSidebarContacts');
              //the last argument suppresses reloading of content1
              that.app.trigger('reloadSidebarMessageChains');
              //log user in
              //show them success screen (introduction/tutorial?)
            },
            error: function(data) {
              alert(data);
            }

          });


    });






    $('#signupOriginInput').on('keyup', function(e) {

      var searchParameter = $('#signupOriginInput').val();

      console.log('searchParameter: ', searchParameter);

      //SHOULD MAYBE THROTTLE THIS ???????

      if (searchParameter.length > 2) {

        $.ajax({
          url: 'http://54.69.226.228:80/locationSearch',
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