window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SidebarEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'sidebarEntryView',

  events: {
    'click': 'clickTrigger'
  },

  initialize: function(app) {
    this.app = app;
    this.topicTemplate = _.template( $('#sidebarTopicEntryTemplate').html() );
    this.placeTemplate = _.template( $('#sidebarPlaceEntryTemplate').html() );
    this.userTemplate = _.template( $('#sidebarUserEntryTemplate').html() );
    this.messageTemplate = _.template( $('#sidebarMessageEntryTemplate').html() );
  },

  renderTopic: function() {
    var that = this;
    this.$el.html( this.topicTemplate(this.model) );

    this.$el.on('mouseover', function() {
      that.app.get('mapController').highlightCountry('United States');
      that.app.get('mapController').highlightCountry('China');
      that.app.get('mapController').highlightCountry('France');
      that.app.get('mapController').highlightCountry('Germany');
      that.app.get('mapController').highlightCountry('Argentina');
      that.app.get('mapController').highlightCountry('Australia');
      that.app.get('mapController').highlightCountry('Monaco');
      that.app.get('mapController').highlightCountry('Italy');
      that.app.get('mapController').highlightCountry('Ecuador');
      that.app.get('mapController').highlightCountry('Palestine');

    });

    this.$el.on('mouseout', function() {
      that.app.get('mapController').removeHighlightCountry('United States');
      that.app.get('mapController').removeHighlightCountry('China');
      that.app.get('mapController').removeHighlightCountry('France');
      that.app.get('mapController').removeHighlightCountry('Germany');
      that.app.get('mapController').removeHighlightCountry('Argentina');
      that.app.get('mapController').removeHighlightCountry('Australia');
      that.app.get('mapController').removeHighlightCountry('Monaco');
      that.app.get('mapController').removeHighlightCountry('Italy');
      that.app.get('mapController').removeHighlightCountry('Ecuador');
      that.app.get('mapController').removeHighlightCountry('Palestine');

    });







  },

  renderPlace: function() {
    this.$el.html( this.placeTemplate(this.model) );
  },

  renderUser: function() {
    var that = this;
    this.$el.html( this.userTemplate(this.model) );
    this.$el.on('mouseover', function() {
      that.app.get('mapController').highlightCountry('Italy');
    });  
    this.$el.on('mouseout', function() {
      that.app.get('mapController').removeHighlightCountry('Italy');
    });    
  },

  renderMessage: function() {
    this.$el.html( this.messageTemplate(this.model) );
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
