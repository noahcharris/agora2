window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.PaginationView = Backbone.View.extend({

  tagName: 'div',

  className: 'paginationView',

  initialize: function(appController) {

    this.app = appController;

  },

  render: function() {
    

  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});