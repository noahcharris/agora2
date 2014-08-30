window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.TopbarView = Backbone.View.extend({

  initialize: function() {
    this.template = _.template( $('#topbarTemplate').html() );
  },

  render: function() {
      
    this.$el.html( this.template(this.model) );
    
  }

});
