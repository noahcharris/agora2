window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function() {
    this.template = _.template( $('#detailUserEntryTemplate').html() );
  },

  render: function() {
    console.log(this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
    var $messageButton = $('<button>SEND MESSAGE</button>');
    messageButton.on('click', function(params) {
      //OPEN UP THE CONVO WITH CONTACT IF IT EXISTS (CONVERSATION VIEW)
      //OTHERWISE TAKE THE USER TO A MESSAGE CREATION VIEW
    });
    this.$el.append($messageButton);
  },

  close: function() {
    this.remove();
    this.unbind();
  }


});