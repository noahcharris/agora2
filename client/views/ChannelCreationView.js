window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.ChannelCreationView = Backbone.View.extend({

  //need to reflect the change in the rest of the file

  tagName: 'div',

  className: 'groupCreationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#channelCreationTemplate').html() );
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

    this.$el.children('#nextButton').on('click', function() {


      $.ajax({
        url: 'http://54.69.226.228:80/createChannel',
        crossDomain: true,
        method: 'POST',
        data: {
          username: that.app.get('username'),
          token: that.app.get('token'),
          name: that.$el.children('#channelNameInput').val(),
          description: that.$el.children('#descriptionInput').val(),
          parent: that.$el.children('#parentInput').val() 
        },
        success: function(data) {
          if (data) {
            alert(data);
            that.app.get('content2').hide();
            // topicsCollection = data;
            // console.log('server returned: ', data);
            // //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
            // sidebarView.collection = data;
            // content1.show(sidebarView);
            that.get('content2').hide(); 
          } else {
            // console.log('memcached returned false');
            // sidebarView.collection = defaultCollection;
            // content1.show(sidebarView);
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    });

    // this.$el.append( $('<button>Next</button>') );

  },

  setHandlers: function() {
    var that = this;


  },

  close: function() {
    console.log('channel creation view closing');
    this.remove();
  }

});