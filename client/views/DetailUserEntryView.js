window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  model: Agora.Models.UserModel,

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function() {
    this.template = _.template( $('#detailUserEntryTemplate').html() );
  },

  render: function() {
    console.log(this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});