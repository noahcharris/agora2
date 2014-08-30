window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.TopicView = Backbone.View.extend({

  tagName: 'div',

  className: 'topicView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _template( $('#topicTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html('Single topic page for real');

    this.$el.append($('<img src="media/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  close: function() {
    console.log('topic view closing');
    this.remove();
  }

});