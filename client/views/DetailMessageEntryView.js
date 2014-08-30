window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailMessageEntryView = Backbone.View.extend({

  model: Agora.Models.MessageModel,

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function() {
    this.template = _.template( $('#detailMessageEntryTemplate').html() );
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});