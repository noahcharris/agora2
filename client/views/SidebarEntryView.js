window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SidebarEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'sidebarEntryView',

  events: {
    'click': 'clickTrigger'
  },

  initialize: function(app) {
    this.app = app;
    this.topicTemplate = _.template( $('#sidebarTopicEntryTemplate').html() );
    this.locationTemplate = _.template( $('#sidebarLocationEntryTemplate').html() );
    this.channelTemplate = _.template( $('#sidebarChannelEntryTemplate').html() );
    this.userTemplate = _.template( $('#sidebarUserEntryTemplate').html() );
    this.messageChainTemplate = _.template( $('#sidebarMessageChainEntryTemplate').html() );
  },

  renderTopic: function() {
    var that = this;
    this.$el.html( this.topicTemplate(this.model) );

    if (!this.model.image) {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').css('width', '0px');
    } else {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').attr('src', this.model.image);
    }



    //IMAGE OVERLAY
    (function() {
      var on = false;
      that.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').on('click', function(e) {
        e.stopPropagation();
        if (!on) {
          on = true;
          var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image +'"></img></div>')
          $overlayImage.on('click', function() {
            $(this).fadeOut(333, function() {
              $(this).remove();
              on = false;
            });
          });
          $('#mainWrapper').append($overlayImage);
          $overlayImage.hide();
          $overlayImage.fadeIn(333);
        }
      });
    })();



    var $username = that.$el.children('.topString').children('.sidebarUsername');
    $username.on('click', function(e) {


      $.ajax({
        url: 'http://liveworld.io:80/user',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.model.username,
          asker: that.app.get('username'),
          //so that this is never cached
          extra: Math.floor((Math.random() * 10000) + 1)
        },
        success: function(data) {
          if (data) {

            console.log('whaaa');
            that.app.get('detailView').displayed = 'Users';
            console.log('server returned: ', data);

            //SERVER NEEDS TO RETURN WHETHER A USER IS A CONTACT OR NOT......

            that.app.get('content2').show(that.app.get('detailView'), data[0]);
          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

      e.stopPropagation();

    });
      


    var mouseoverHandler = _.once(function () {
      //woooooooo
      var thet = this;
      $.ajax({
        url: 'http://liveworld.io:80/topicLocations',
        // url: 'http://localhost:80/topicLocations',
        method: 'GET',
        crossDomain: true,
        data: {
          topicId: that.model.id
        },
        success: function(data) {
            console.log('oaaaá222222server returned: ', data);
            console.log(typeof data);

          for (var i=0; i < data.length ;i++) {

            var f = function() {
              var x = data[i];
              that.$el.on('mouseover', function() {
                that.app.get('mapController').highlightCountry(x);
              });
              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightCountry(x);
              });
            };
            f();

          }

            
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });
    });
    this.$el.on('mouseover', mouseoverHandler);



  },

  renderLocation: function() {
    this.$el.html( this.locationTemplate(this.model) );
  },

  renderChannel: function() {
    this.$el.html( this.channelTemplate(this.model) );
  },

  renderUser: function() {
    var that = this;


    this.$el.html( this.userTemplate(this.model) );

    if (!this.model.image) {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').css('width', '0px');
    } else {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').attr('src', this.model.image);
    }

    //IMAGE OVERLAY
    (function() {
      var on = false;
      that.$el.children('.sidebarFloatClear').children('.sidebarTopicImage')[0].onclick = function(e) {
        e.stopPropagation();
        if (!on) {
          on = true;
          var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image +'"></img></div>')
          $overlayImage.on('click', function() {
            $(this).fadeOut(333, function() {
              $(this).remove();
              on = false;
            });
          });
          $('#mainWrapper').append($overlayImage);
          $overlayImage.hide();
          $overlayImage.fadeIn(333);
        }
      };
    })();

    this.$el.on('mouseover', function() {
      that.app.get('mapController').highlightCountry(that.model.location);
    });  
    this.$el.on('mouseout', function() {
      that.app.get('mapController').removeHighlightCountry(that.model.location);
    });    
  },

  renderMessageChain: function() {

    var that = this;

    //have to do a little reshuffling..
    if (this.model.username1 === this.app.get('username')) {
      this.model.contact = this.model.username2;
    } else {
      this.model.contact = this.model.username1;
    }

    this.$el.html( this.messageChainTemplate(this.model) );

    var location = this.model.location || 'World';

    this.$el.on('mouseover', function() {
      that.app.get('mapController').highlightCountry(location);
    });  
    this.$el.on('mouseout', function() {
      that.app.get('mapController').removeHighlightCountry(location);
    }); 
  },

  clickTrigger: function() {
    //have to remember to call model.get when not using .toJSON()
    this.trigger('click', this.model.id, this.model.type);
  },

  close: function() {
    this.remove();
    this.unbind();
  }
});
