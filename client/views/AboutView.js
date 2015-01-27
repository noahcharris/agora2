window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.AboutView = Backbone.View.extend({

  tagName: 'div',

  className: 'aboutView',

  initialize: function(appController) {

    this.app = appController;
    this.template = _.template( $('#aboutTemplate').html() );

  },

  render: function() {


  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});