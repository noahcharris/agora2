window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailChannelEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailChannelEntryTemplate').html() );
    this.RTLtemplate = _.template( $('#RTLdetailChannelEntryTemplate').html() );
  },

  render: function() {
    var that = this;

    this.model.aboutLabel = this.app.translate('About');
    this.model.goToLabel = this.app.translate('Go To Channel');
    if (this.app.get('language') !== 'ar') {
      this.$el.html( this.template(this.model) );
    } else {
      this.$el.html( this.RTLtemplate(this.model) );
    }

    var $goTo = this.$el.children('#channelBox').children('#goToButton');

    if (this.app.get('channel') === that.model.name)
      $goTo.hide();

    $goTo[0].onclick = function() {

      that.app.set('channel', that.model.name);
      that.app.get('channelView').render();
      that.app.trigger('reloadSidebarTopics', that.app.get('mapController').get('location'));
      that.app.get('sidebarView').displayed = 'Topics-Top';
      that.app.get('content1').show(that.app.get('sidebarView'));
      that.app.get('content2').hide();

    };

    //close click handler
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});