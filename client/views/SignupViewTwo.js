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

    this.$el.append($('<img src="media/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  setHandlers: function() {
    var that = this;
    this.$el.children('button').on('click', function() {


      //NEEDS TO BE OVER HTTPS!!!!
      $.ajax({

        url: 'createUser',
        method: 'POST',
        data: {
          username: that.data.username,
          password: that.data.password,
          origin: that.data.origin,
          email: that.data.email,
          about: that.data.about
        },
        success: function(data) {
          alert(data);
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