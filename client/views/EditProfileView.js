window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.EditProfileView = Backbone.View.extend({

  tagName: 'div',

  className: 'editProfileView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#registrationViewTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    this.$el.empty();
    this.$el.append($('<p class="x">X</p>'));
    this.$el.children('p.x').on('click', function() {
      that.app.get('content2').hide();
    });
    //maybe pull the users profile in here for use with the edit view
    //prepopulate the fields with current data?
    this.$el.append( this.template() );s
  },

  setHandlers: function() {

  },

  close: function() {
    console.log('registrationView closing');
    console.log(this);
    this.remove();
  }


})