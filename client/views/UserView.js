window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.UserView = Backbone.View.extend({

  tagName: 'div',

  className: 'userView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#userTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html('User page for real');

    this.$el.append($('<img src="media/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  close: function() {
    console.log('user view closing');
    this.remove();
  }

});