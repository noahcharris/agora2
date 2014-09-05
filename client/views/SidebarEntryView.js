window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SidebarEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'sidebarEntryView',

  events: {
    'click': 'clickTrigger'
  },

  initialize: function() {
    this.topicTemplate = _.template( $('#sidebarTopicEntryTemplate').html() );
    this.groupTemplate = _.template( $('#sidebarGroupEntryTemplate').html() );
    this.subgroupTemplate = _.template( $('#sidebarSubgroupEntryTemplate').html() );
    this.placeTemplate = _.template( $('#sidebarPlaceEntryTemplate').html() );
    this.userTemplate = _.template( $('#sidebarUserEntryTemplate').html() );
    this.messageTemplate = _.template( $('#sidebarMessageEntryTemplate').html() );
  },

  renderTopic: function() {
    this.$el.html( this.topicTemplate(this.model) );
  },

  renderGroup: function() {
    this.$el.html( this.groupTemplate(this.model) );
  },

  renderPlace: function() {
    this.$el.html( this.placeTemplate(this.model) );
  },

  renderSubgroup: function() {
    this.$el.html( this.subgroupTemplate(this.model) );
  },

  renderUser: function() {
    this.$el.html( this.userTemplate(this.model) );
  },

  renderMessage: function() {
    this.$el.html( this.messageTemplate(this.model) );
  },

  renderUser: function() {
    this.$el.html( this.userTemplate(this.model) );
  },

  clickTrigger: function() {
    //have to remember to call model.get when not using .toJSON()
    this.trigger('click', this.model.id, this.model.type);
  },

  close: function() {
    this.remove();
    this.unbind();
  }
});
