window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.SubgroupCreationView = Backbone.View.extend({

  tagName: 'div',

  className: 'subgroupCreationView',

  initialize: function(appController) {
    this.app = appController;
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html('subgroup creation page for real');

    this.$el.append($('<img src="media/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  },

  close: function() {
    console.log('subgroup creation view closing');
    this.remove();
  }

});