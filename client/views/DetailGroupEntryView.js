window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailGroupEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function() {
    this.template = _.template( $('#detailGroupEntryTemplate').html() );
  },

  render: function() {
    this.$el.html(this.template(this.model));
    //click handler is set in DetailView
    this.$el.children('div#groupBox').append('<button class="visitButton">Visit '+this.model.get('name')+'</button>');
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});