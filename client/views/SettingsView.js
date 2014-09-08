window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SettingsView = Backbone.View.extend({

  tagName: 'div',

  className: 'settingsView',

  initialize: function(appController) {
    this.template = _.template( $('#settingsViewTemplate').html() );
    this.app = appController;
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

    var $pathCreationButton = $('<li>CREATE YR OWN PATH</li>');
    $pathCreationButton.on('click', function() {
      that.app.get('content2').show(new Agora.Views.PathCreationView(that.app));
    });
    this.$el.children('#settingsViewList').append($pathCreationButton);

    var $channelCreationButton = $('<li>CREATE YR OWN CHANNEL!!!</li>');
    $channelCreationButton.on('click', function() {
      that.app.get('content2').show(new Agora.Views.ChannelCreationView(that.app));
    });
    this.$el.children('#settingsViewList').append($channelCreationButton);


  },

  close: function() {
    console.log('settingsviewclosing');
    this.remove();
  }

});
