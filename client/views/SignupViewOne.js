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
      var signupTwo = new Agora.Views.SignupViewTwo(that.app);
      signupTwo.data = {
        //email: $('#signupEmailInput').val(),
        username: $('#signupUsernameInput').val(),
        //need to check with confirmation field
        password: $('#signupPasswordInput').val(),
        //origin: $('#signupOriginInput').val(),
        about: $('signupAboutInput').val()
      };

      //LEAVING OUT SIGNUPVIEWTWO for now
      //that.app.get('content2').show(signupTwo);


      $.ajax({

        url: 'https://localhost:443/registerUser',
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

          that.app.get('topbarView').model.user = $('#signupUsernameInput').val();
          that.app.get('topbarView').render();
          that.app.set('username', $('#signupUsernameInput').val());

          that.app.get('content2').hide();
          //log user in
          //show them success screen (introduction/tutorial?)
        },
        error: function(data) {
          alert(data);
        }

      });



    });
  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});