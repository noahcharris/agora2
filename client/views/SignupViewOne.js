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

            url: 'http://54.149.63.77:80/registerUser',
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
  },

  close: function() {
    console.log('signup one view closing');
    this.remove();
  }

});