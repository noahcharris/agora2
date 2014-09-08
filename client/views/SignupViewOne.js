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
        email: $('#signupEmailInput').val(),
        username: $('#signupUsernameInput').val(),
        //need to check with confirmation field
        password: $('#signupPasswordInput').val(),
        origin: $('#signupOriginInput').val(),
        about: $('signupAboutInput').val()
      };

      that.app.get('content2').show(signupTwo);
    });
  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});