window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.RegistrationView = Backbone.View.extend({

  tagName: 'div',

  className: 'registrationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#registrationViewTemplate').html() );
    this.$el.addClass('detailView');
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
    $('#loginButton').on('click', function() {
      var username = $('#loginUsernameInput').val();
      var password = $('#loginPasswordInput').val();
      $('#loginUsernameInput').val('');
      $('#loginPasswordInput').val('');

      //LOGIN (This needs to be done over HTTPS, I just don't know how yet)
      //  -need to interact over both ports

      //CHANGING THIS BACK TO HTTP BECAUSE IT SEEMS TO BREAK COOKIES, HAVE TO TRY WITH A REAL SERVER

      $.ajax({
        url: 'http://54.149.63.77:80/login',
        // url: 'http://localhost/login',
        crossDomain: true,
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        success: function(data) {
          if (data === 'True') {
            //login subroutine
            that.app.set('login', true);
            that.app.set('username', username);
            that.app.get('topbarView').render();
            that.app.get('content2').hide();
            //why do I need this?
            that.app.trigger('reloadSidebarContacts');
            //the last argument suppresses reloading of content1
            that.app.trigger('reloadSidebarMessageChains');

            that.app.get('cacheManager').start();


          } else {
            alert('login failed');
          }


        }
      });

    });

    $('#logoutButton').on('click', function() {
      
      $.ajax({
        url: 'http://54.149.63.77:80/logout',
        // url: 'http://localhost/login',
        crossDomain: true,
        method: 'GET',
        data: {
        },
        success: function(data) {
          if (data === 'True') {
            //login subroutine
            that.app.set('login', false);
            that.app.get('cacheManager').stop();
            that.app.set('username', null);
            that.app.get('topbarView').render();
            //why do I need this?
            // that.app.get('sidebarView').displayed = 'Topics-Top';
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

      var signupOne = new Agora.Views.SignupViewOne(that.app);
      that.app.get('content2').show(signupOne);


      // setTimeout(function() {
      //   that.app.get('alertView').mode = 'FollowupSuccess';
      //   that.app.get('content2').show(that.app.get('alertView'));
      // },400);

    });

  },

  close: function() {
    console.log('registrationView closing');
    console.log(this);
    this.remove();
  }



});
