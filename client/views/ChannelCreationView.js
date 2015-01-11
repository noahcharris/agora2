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

    this.channelVerified = false;
    this.checker = null;
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    console.log(this.$el.children('input:radio[name=publicPrivate]').val());

    this.$el.children('#nextButton').on('click', function() {

      var temp = $('#parentInput').val();
      if (temp.split('/')[0] === 'General') {
        this.channelVerified = true;
      } else {
        this.channelVerified = false;
      }

      if (!this.channelVerified) {
        alert('Your parent channel must begin with "General"');
      } else {
        $.ajax({
          url: 'https://liveworld.io:443/createChannel',
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
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
              that.app.changeChannel(that.$el.children('#parentInput').val()+'/'+that.$el.children('#channelNameInput').val());
              that.app.get('mapController').showWorld();
            } else {
              // console.log('memcached returned false');
              // sidebarView.collection = defaultCollection;
              // content1.show(sidebarView);
            }
          }, error: function(err) {
            console.log('ajax error ocurred: ', err);
          }

        });
      }





    });


    this.$el.children('#parentInput').on('keyup', function(e) {

      var searchParameter = $('#parentInput').val();

      //SHOULD MAYBE THROTTLE THIS ???????

      if ($('#parentInput').val().length > 1) {

        $.ajax({
          url: 'http://liveworld.io:80/channelSearch',
          //url: 'http://localhost:80/channelSearch',
          data: {
            input: searchParameter
          },
          crossDomain: true,
          success: function(data) {
            console.log(data);
            $('.creationChannelSearchResult').remove();

            var cssAdjust = -30;
            for (var i=0; i < data.length ;i++) {

              var $element = $('<div class="creationChannelSearchResult">'+data[i].name+'</div>');
              that.$el.append($element);

              (function() {
                var x = data[i].name;
                $element.on('click', function(e)  {
                  that.$el.children('#parentInput').val(x);
                  $('.creationChannelSearchResult').remove();
                });
                
              })();

              $element.css('bottom', cssAdjust + 'px');

              cssAdjust -= 30;
            }

          }
        });

      } else if (searchParameter === '') {
        $('.creationChannelSearchResult').remove();
      }

  });//end parent input keyup event


  this.checker = setInterval(function() {
    if ($('#parentInput').val()) {

      //analyse parent input and make sure it is correct

        var temp = $('#parentInput').val();
        if (temp.split('/')[0] === 'General') {
          this.channelVerified = true;
        } else {
          this.channelVerified = false;
        }

      }

  }, 500);





  },//end render()

  setHandlers: function() {
    var that = this;


  },

  close: function() {
    clearInterval(this.checker);
    console.log('channel creation view closing');
    this.remove();
  }

});