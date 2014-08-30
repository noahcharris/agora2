window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailSubgroupEntryView = Backbone.View.extend({

  model: Agora.Models.SubgroupModel,

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailSubgroupEntryTemplate').html() );
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.append('<button class="visitButton">Visit '+this.model.get('name')+'</button>');
  },

  setHandlers: function() {

  },

  close: function() {
    this.remove();
    this.unbind();
  }



});