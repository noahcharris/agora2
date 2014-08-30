window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.EmailInviteView = Backbone.View.extend({

  tagName: 'div',

  className: 'emailInviteView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#emailInviteViewTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

  //   this.$el.empty();
  //   this.$el.html( this.template() );

    this.$el.append($('<img src="media/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

  //   this.$el.append($('<img src="media/x.png" class="x"></img>'));
  //   this.$el.children('img.x').on('click', function() {
  //     that.app.get('content2').hide();
  //   });

  //   this.$el.append( $('<button>Next</button>') );

  },

  setHandlers: function() {
    var that = this;

  },

  close: function() {
    console.log('group invite view closing');
    this.remove();
  }

});