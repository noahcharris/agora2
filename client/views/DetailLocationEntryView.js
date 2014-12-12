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
    var that = this;
    this.$el.html( this.template(this.model) );

    var $goTo = this.$el.children('#locationBox').children('#goToButton');

    if (this.app.get('mapController').get('location') === that.model.name)
      $goTo.hide();

    $goTo[0].onclick = function() {

      that.app.trigger('reloadSidebarTopics', that.model.name);
      that.app.get('mapController').goToPath(that.model.name);
      that.app.get('sidebarView').displayed = 'Topics-Top';
      that.app.get('content1').show(that.app.get('sidebarView'));
      that.app.get('content2').hide();

    };

  },

  close: function() {
    this.remove();
    this.unbind();
  }


});