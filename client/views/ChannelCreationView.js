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


    var channelNameLabel = this.app.translate('Channel Name');
    var radioPrefixLabel = this.app.translate('This location is');
    var availabilityLabel = this.app.translate('Check Availability');
    var publicLabel = this.app.translate('Public');
    var privateLabel = this.app.translate('Private');
    var descriptionLabel = this.app.translate('Description');
    var parentChannelLabel = this.app.translate('Parent Channel');
    var doneLabel = this.app.translate('Create Channel');
    var backLabel = this.app.translate('Back');


    this.$el.html( this.template( {publicLabel: publicLabel, privateLabel: privateLabel, doneLabel: doneLabel,
                                  radioPrefixLabel: radioPrefixLabel, availabilityLabel: availabilityLabel,
                                  backLabel: backLabel} ) );
    this.$el.children('#channelNameInput').attr('placeholder', channelNameLabel);

    this.$el.children('#descriptionInput').attr('placeholder', descriptionLabel);
    this.$el.children('#parentInput').attr('placeholder', parentChannelLabel);

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    //console.log(this.$el.children('input:radio[name=publicPrivate]').val());



    var $availabilityButton = that.$el.children('button#checkAvailabilityButton');
    $availabilityButton.on('click', function() {

      console.log(that.$el.children('input#parentInput').val());
      $.ajax({
        url: 'http://egora.co:80/validateChannel',
        // url: 'http://localhost:80/locationSearch',
        data: {
          name: that.$el.children('input#channelNameInput').val(),
          parent: that.$el.children('input#parentInput').val()
        },
        crossDomain: true,
        success: function(data) {

          if (data === 'Available') {
            alert(that.app.translate('channel available :)'));
          } else {
            alert(that.app.translate(data));
          }

        },
        error: function(data) {
          console.log('server error');
        }
      });



    });




    this.$el.children('#nextButton').on('click', function() {

      if ($('#channelNameInput').val() === '') {

      }

      var temp = $('#parentInput').val();
      if (temp.split('/')[0] === 'All') {
        this.channelVerified = true;
      } else {
        this.channelVerified = false;
      }


      if (!that.$el.children('#channelNameInput').val()) {
        alert(that.app.translate('you must enter a name for your channel'));
      } else if (!this.channelVerified) {
        alert(that.app.translate('your parent channel must begin with "All"'));
      } else if (!$('.g-recaptcha-response').val()) {
        alert(that.app.translate('please complete CAPTCHA'));
      } else {
        $.ajax({
          url: 'https://egora.co:443/createChannel',
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
            parent: that.$el.children('#parentInput').val(),
            responseString: $('.g-recaptcha-response').val() 
          },
          success: function(data) {
            if (data[0] === 's') {
              alert(that.app.translate(data));
              that.app.get('content2').hide();
              that.app.changeChannel(that.$el.children('#parentInput').val()+'/'+that.$el.children('#channelNameInput').val());
              that.app.get('mapController').showWorld();
            } else {
              alert(that.app.translate(data));
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
          url: 'http://egora.co:80/channelSearch',
          //url: 'http://localhost:80/channelSearch',
          data: {
            input: searchParameter
          },
          crossDomain: true,
          success: function(data) {
            console.log(data);
            $('.creationChannelSearchResult').remove();

            for (var i=0; i < data.length ;i++) {

              var $element = $('<div class="creationChannelSearchResult">'+data[i].name+'</div>');
              that.$el.children('#createChannelSearchContainer').append($element);

              (function() {
                var x = data[i].name;
                $element.on('click', function(e)  {
                  that.$el.children('#parentInput').val(x);
                  $('.creationChannelSearchResult').remove();
                });
                
              })();
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
        if (temp.split('/')[0] === 'All') {
          this.channelVerified = true;
        } else {
          this.channelVerified = false;
        }

      }

  }, 500);


  
  var $backButton = this.$el.children('#backButton');
  $backButton.on('click', function() {
    that.app.get('detailView').displayed = 'Settings';
    that.app.get('content2').show(that.app.get('settingsView'));
  });





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