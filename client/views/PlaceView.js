window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.PlaceView = Backbone.View.extend({

  tagName: 'div',

  className: 'placeView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#placeTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template( this.model ) );

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  close: function() {
    console.log('place view closing');
    this.remove();
  }

});