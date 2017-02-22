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
    this.$el.append( $('<img src="https://s3-us-west-2.amazonaws.com/agora-static-storage/x.png" class="x"></img>') );
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });




    var bigLoginLabel = this.app.translate('LOG IN');
    var smallLoginLabel = this.app.translate('Log In');
    var logoutLabel = this.app.translate('Log Out');
    var bigRegisterLabel = this.app.translate('REGISTER');
    var smallRegisterLabel = this.app.translate('Register');
    var usernameLabel = this.app.translate('username');
    var passwordLabel = this.app.translate('password');

    this.$el.append( this.template( {bigLoginLabel: bigLoginLabel, smallLoginLabel: smallLoginLabel,
                                    logoutLabel: logoutLabel, bigRegisterLabel: bigRegisterLabel,
                                     smallRegisterLabel: smallRegisterLabel} ) );

    this.$el.children('div.login').children('#loginUsernameInput').attr('placeholder', usernameLabel);
    this.$el.children('div.login').children('#loginPasswordInput').attr('placeholder', passwordLabel);


    

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
        url: 'https://54.202.31.15:443/login',
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

            that.app.get('mapController').goToPath(data.location);


          } else {
            alert(that.app.translate(data));
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
        url: 'https://54.202.31.15:443/logout',
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
            alert(that.app.translate('logout failed'));
            that.app.set('login', true);
          }
        },
        error: function(err) {
          alert(that.app.translate('server error'));
        }
      });

      that.app.set('login', false);
    });

    $('#signupButton').on('click', function() {
      $('#signupInput').val('');

      var signupView = new Agora.Views.SignupView(that.app);
      that.app.get('content2').show(signupView);



    });

  },

  close: function() {
    $(window).unbind('keypress', this.enterHandler);
    this.remove();
  }



});
