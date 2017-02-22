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



    this.$el.append($('<img src="https://s3-us-west-2.amazonaws.com/agora-static-storage/x.png" class="x"></img>'));
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
      url: 'https://54.202.31.15:443/authenticateTwitter',
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
        
        if (data[0] === 'c') {
          that.$el.append('you have already associated a twitter account to your profile');
        } else {
          var explanationLabel = that.app.translate('If you connect your twitter account, Egora will pull your latest tweets and place them into your current location under the channel All/Twitter.')
          that.$el.append('<br/>');
          that.$el.append(explanationLabel);
          that.$el.append('<br/>');
          var twitterLabel = that.app.translate('Continue');
          var twitterLink = $('<a href="'+data+'" target="_blank">'+twitterLabel+'</a> ')
          that.$el.append(twitterLink)
        }



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