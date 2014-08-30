window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailPlaceEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailPlaceEntryTemplate').html() );
  },

  render: function() {
    this.$el.html( this.template(this.model) );
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});