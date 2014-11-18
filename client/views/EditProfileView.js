window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.EditProfileView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryView',

  initialize: function(appController) {
    this.app = appController;
    //this.template = _.template( $('#editViewTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;
    this.$el.empty();

    var $x = $('<img src="resources/images/x.png" class="x"></img>')


    this.$el.append( $x );

    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('sidebarView').removeHighlights();
      that.app.get('content2').hide();
    }


    //maybe pull the users profile in here for use with the edit view
    //prepopulate the fields with current data?

    //do we even need template?
    //this.$el.append( this.template() );
  },

  setHandlers: function() {

  },

  close: function() {
    console.log('registrationView closing');
    console.log(this);
    this.remove();
  }


})