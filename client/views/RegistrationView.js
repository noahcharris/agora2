window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.RegistrationView = Backbone.View.extend({

  tagName: 'div',

  className: 'registrationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#registrationViewTemplate').html() );
    this.$el.addClass('detailView');
    this.enterHandler = null;
  },

  render: function() {
    var that = this;
    
    this.$el.empty();
    this.$el.append( $('<img src="resources/images/x.png" class="x"></img>') );
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });
    this.$el.append( this.template() );

    setTimeout(function() {
      that.$el.children('div.login').children('input#loginUsernameInput').focus();
    }, 1000);






    //append logout button if user is logged in:
    // if (this.app.get('login')) {
    //   this.$el.append($('<button id="logoutButton">Logout</button>'));
    // }
  },

  setHandlers: function() {
    var that = this;


    var loginHandler = function() {

      var username = $('#loginUsernameInput').val();
      var password = $('#loginPasswordInput').val();
      $('#loginUsernameInput').val('');
      $('#loginPasswordInput').val('');

      $.ajax({
        url: 'https://liveworld.io:443/login',
        // url: 'http://localhost/login',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        success: function(data) {
          if (data.login === true) {
            //login subroutine

            //TOKENZ!!
            that.app.set('token', data.token);

            that.app.set('login', true);
            that.app.set('username', data.username);

            that.app.get('cacheManager').stop();
            that.app.get('cacheManager').emptyCache();

            that.app.get('topbarView').render();
            that.app.get('content2').hide();
            //why do I need this?
            that.app.get('mapController').placing = false;
            that.app.trigger('reloadSidebarContacts');
            //the last argument suppresses reloading of content1
            that.app.trigger('reloadSidebarMessageChains');
            that.app.trigger('reloadSidebarTopics');

            that.app.get('cacheManager').start();


          } else {
            alert(data);
          }


        }
      });

    };


    this.enterHandler = function(e) {

      if (e.keyCode === 13 && $('#loginPasswordInput').is(':focus')) {

        loginHandler();


      }

    };


    $(window).keypress(this.enterHandler);

    $('#loginButton').on('click', function() {

      loginHandler();
      

    });

    $('#logoutButton').on('click', function() {
      
      $.ajax({
        url: 'https://liveworld.io:443/logout',
        // url: 'http://localhost/login',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        method: 'GET',
        data: {
          username: that.app.get('username'),
          token: that.app.get('token')
        },
        success: function(data) {
          if (data === 'True') {
            //login subroutine
            that.app.set('login', false);
            that.app.get('cacheManager').stop();
            that.app.get('cacheManager').emptyCache();
            that.app.set('username', null);
            that.app.get('topbarView').render();
            //why do I need this?
            // that.app.get('sidebarView').displayed = 'Topics-Top';
            that.app.get('mapController').placing = false;
            that.app.get('mapController').showWorld();
            that.app.get('content1').show(that.app.get('sidebarView'));

          } else {
            alert('logout failed');
            that.app.set('login', true);
          }
        },
        error: function(err) {
          alert('ajax error: ', err);
        }
      });

      that.app.set('login', false);
    });

    $('#signupButton').on('click', function() {
      $('#signupInput').val('');

      var signupView = new Agora.Views.SignupView(that.app);
      that.app.get('content2').show(signupView);


      // setTimeout(function() {
      //   that.app.get('alertView').mode = 'FollowupSuccess';
      //   that.app.get('content2').show(that.app.get('alertView'));
      // },400);

    });

  },

  close: function() {
    $(window).unbind('keypress', this.enterHandler);
    this.remove();
  }



});
