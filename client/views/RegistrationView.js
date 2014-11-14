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

      //CHANGING THIS BACK TO HTTP BECAUSE IT SEEMS TO BREAK COOKIES, HAVE TO TRY WITH A REAL SERVER...

      $.ajax({
        url: 'http://localhost/login',
        crossDomain: true,
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        success: function(data) {
          if (data === 'True') {
            alert('login succeeded');
            that.app.set('login', true);

            that.app.get('topbarView').model.user = username;
            that.app.get('topbarView').render();
            that.app.get('content2').hide();

          } else {
            alert('login failed');
            that.app.set('login', false);
          }


        }
      });

    });

    $('#logoutButton').on('click', function() {
      //ajax call to server to log out
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
