window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailUserEntryTemplate').html() );
  },

  render: function() {
    console.log(this.model);
    this.$el.html( this.template(this.model) );
    var $messageButton = $('<button>SEND MESSAGE</button>');
    $messageButton.on('click', function(params) {
      //OPEN UP THE CONVO WITH CONTACT IF IT EXISTS (CONVERSATION VIEW)
      //OTHERWISE TAKE THE USER TO A MESSAGE CREATION VIEW
    });
    var $contactButton = $('<button>Contact Request</button>');
    $contactButton.on('click', function() {
      //ajax
    });

    var random = Math.floor((Math.random() * 10000) + 1)
    this.$el.children('#profileColumnWrapper').children('#profilePicture').attr('src', this.model.image + '?extra=' + random);

    var $toolColumn = this.$el.children('#profileColumnWrapper').children('div#profileRightColumn');
    //need to return whether the user is a contact or not...
    if (this.model.username !== this.app.get('username')) {
      $toolColumn.append($messageButton);
      if (!this.model.isContact) {
        $toolColumn.append($('<br/>'));
        $toolColumn.append($contactButton);
      }

    }

  },

  close: function() {
    this.remove();
    this.unbind();
  }


});