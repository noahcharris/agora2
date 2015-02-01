window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.TwitterView = Backbone.View.extend({

  tagName: 'div',

  className: 'inviteView',

  initialize: function(appController) {

    this.app = appController;
    //this.template = _.template( $('#aboutTemplate').html() );

  },

  render: function() {
    var that = this;



    this.$el.append($('<img src="/resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });



    var $backButton = $('<button id="backButton">'+that.app.translate('Back')+'</button>')
    $backButton.on('click', function() {
      that.app.get('detailView').displayed = 'Settings';
      that.app.get('content2').show(that.app.get('settingsView'));
    });
    this.$el.append($backButton);
    that.$el.append($('<br/>'));

    //ajax call to getInvites and append them
    $.ajax({
      url: 'https://liveworld.io:443/authenticateTwitter',
      // url: 'http://localhost:80/user',
      method: 'GET',
      crossDomain: true,
      data: {
        username: that.app.get('username'),
        token: that.app.get('token')
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        
        var twitterLabel = that.app.translate('Continue');
        var twitterLink = $('<a href="'+data+'" target="_blank">'+twitterLabel+'</a> ')
        that.$el.append(twitterLink)



      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });




  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});