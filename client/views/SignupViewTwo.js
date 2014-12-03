window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SignupViewTwo = Backbone.View.extend({

  tagName: 'div',

  className: 'signupViewOne',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#signupTwoTemplate').html() );
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


      //NEEDS TO BE OVER HTTPS!!!!
      $.ajax({

        url: 'http://54.149.63.77:80/registerUser',
        // url: 'https://localhost:443/registerUser',
        method: 'POST',
        crossDomain: true,
        data: {
          username: that.data.username,
          password: that.data.password,
          origin: that.data.origin,
          email: that.data.email,
          about: that.data.about
        },
        success: function(data) {
          alert(data);

          that.app.set('login', true);

          that.app.get('topbarView').model.user = that.data.username;
          console.log('heeyeyyyy');
          console.log(that.data.username);
          that.app.get('topbarView').render();
          that.app.set('username', username);

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
    console.log('signup two view closing');
    this.remove();
  }

});