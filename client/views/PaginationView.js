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

    var nextLabel = this.app.translate('Next');
    this.$el.children('#paginationNextButton').text(nextLabel);


    this.$el.children('.paginationIcon').on('click', function() {

      that.app.get('sidebarView').page =  parseInt($(this).attr('name'));

      that.app.trigger('reloadSidebarTopics',
        that.app.get('mapController').get('location'));

      //reload sidebar to new page, pass it 
      //as an argument to reloadSidebarTopic,
      //which will need to be refitted
    });

    $(this.$el.children('.paginationIcon')[page-1]).css('text-decoration', 'underline');

    if (page === 10) {
      this.$el.children('#paginationNextButton').hide();
    }


    this.$el.children('#paginationNextButton').on('click', function() {

      that.app.get('sidebarView').page =  that.app.get('sidebarView').page + 1;

      that.app.trigger('reloadSidebarTopics',
        that.app.get('mapController').get('location'));




    });

  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});