window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailChannelEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailChannelEntryTemplate').html() );
  },

  render: function() {
    this.$el.html( this.template(this.model) );


    //close click handler
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});