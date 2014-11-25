window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.PaginationView = Backbone.View.extend({

  tagName: 'div',

  className: 'paginationView',

  initialize: function(appController) {

    this.app = appController;
    this.template = _.template( $('#paginationTemplate').html() );

  },

  render: function(page) {

    this.$el.append( this.template() );


  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});