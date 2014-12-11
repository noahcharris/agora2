window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.ChannelCreationView = Backbone.View.extend({

  //need to reflect the change in the rest of the file

  tagName: 'div',

  className: 'groupCreationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#creationTemplate').html() );
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    console.log(that.$el.children('input:radio[name=public]').val());

    // this.$el.append( $('<button>Next</button>') );

  },

  setHandlers: function() {
    var that = this;


  },

  close: function() {
    console.log('group creation view closing');
    this.remove();
  }

});