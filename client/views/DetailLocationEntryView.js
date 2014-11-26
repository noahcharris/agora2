window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailLocationEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailLocationEntryTemplate').html() );
  },

  render: function() {
    this.$el.html( this.template(this.model) );

  },

  close: function() {
    this.remove();
    this.unbind();
  }


});