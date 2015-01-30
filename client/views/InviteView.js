window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.InviteView = Backbone.View.extend({

  tagName: 'div',

  className: 'inviteView',

  initialize: function(appController) {

    this.app = appController;
    //this.template = _.template( $('#aboutTemplate').html() );

  },

  render: function() {
    var that = this;




    var $backButton = $('<button id="backButton">'+that.app.translate('Back')+'</button>')
    $backButton.on('click', function() {
      that.app.get('detailView').displayed = 'Settings';
      that.app.get('content2').show(that.app.get('settingsView'));
    });
    this.$el.append($backButton);
    that.$el.append($('<br/>'));

    //ajax call to getInvites and append them
    $.ajax({
      url: 'https://liveworld.io:443/getInvites',
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
        
        for (var i=0; i < data.length ;i++) {
          that.$el.append(data[i].code);
          that.$el.append($('<br/>'));
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