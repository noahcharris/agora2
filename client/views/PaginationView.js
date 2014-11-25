window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.PaginationView = Backbone.View.extend({

  tagName: 'div',

  className: 'paginationView',

  initialize: function(appController) {

    this.app = appController;
    this.template = _.template( $('#paginationTemplate').html() );

  },

  render: function(page) {

    var that = this;

    this.$el.append( this.template() );

    this.$el.children('.paginationIcon').on('click', function() {
      alert($(this).attr('name'));
      that.app.get('sidebarView').page = $(this).attr('name');

      //reload sidebar to new page, pass it 
      //as an argument to reloadSidebarTopic,
      //which will need to be refitted

    });

    this.$el.children('#paginationNextButton').on('click', function() {
      alert(that.app.get('sidebarView').page + 1);
    });

  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});