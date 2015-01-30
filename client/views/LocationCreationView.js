window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.LocationCreationView = Backbone.View.extend({

  //need to reflect the change in the rest of the file

  tagName: 'div',

  className: 'groupCreationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#locationCreationTemplate').html() );
    this.$el.addClass('detailView');

    this.checker = null;
    this.cityVerified = false;
  },

  render: function() {
    var that = this;

    this.$el.empty();


    var locationNameLabel = this.app.translate('Location Name');
    var radioPrefixLabel = this.app.translate('This location is');
    var availabilityLabel = this.app.translate('Check Availability');
    var publicLabel = this.app.translate('Public');
    var privateLabel = this.app.translate('Private');
    var descriptionLabel = this.app.translate('Description');
    var parentLocationLabel = this.app.translate('Parent City');
    var nextLabel = this.app.translate('Place on Map');
    var backLabel = this.app.translate('Back');
    var explanationLabel1 = this.app.translate('Your location must belong to a city');
    var explanationLabel2 = this.app.translate("Don't see your city? Please email us the name at ??? and we will add it into our database.");

    this.$el.html( this.template( {publicLabel: publicLabel, privateLabel: privateLabel, nextLabel: nextLabel,
                                  radioPrefixLabel: radioPrefixLabel, explanationLabel1: explanationLabel1,
                                  availabilityLabel: availabilityLabel, explanationLabel2: explanationLabel2,
                                  backLabel: backLabel} ) );
    this.$el.children('#locationNameInput').attr('placeholder', locationNameLabel);
    this.$el.children('#descriptionInput').attr('placeholder', descriptionLabel);
    this.$el.children('#parentInput').attr('placeholder', parentLocationLabel);

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });


    var backLabel = this.app.translate('Back');
    var $backButton = this.$el.children('#backButton');
    $backButton.on('click', function() {
      that.app.get('detailView').displayed = 'Settings';
      that.app.get('content2').show(that.app.get('settingsView'));
    });

  },

  setHandlers: function() {
    var that = this;



    this.$el.children('#nextButton').on('click', function() {

      if ($('#parentInput').val()) {
        for (var key in that.app.get('mapController').get('cities')._layers) {
          if (that.app.get('mapController').get('cities')._layers[key].city === $('#parentInput').val()) {
            that.cityVerified = true;
            break;
          }
        }
        this.cityVerified = false;
      }

      if (!that.$el.children('#locationNameInput').val()) {
        alert(that.app.translate('you must enter a name for your location'));
      } else if (!that.cityVerified) {
        alert(that.app.translate('you must choose a valid parent city'));
      } else {
        console.log('RADIO INPUT : ', that.$el.children('input:radio[name=publicPrivate]').val());

        var pub = true;
        if (that.$el.children('input:radio[name=publicPrivate]').val() === 'public') {
          pub = true;
        } else {
          pub = false;
        }

        var placementView = new Agora.Views.PlacementView(that.app);
        console.log(placementView);

        placementView.data = {
          name: that.$el.children('#locationNameInput').val(),
          //CHANGE THIS WHEN WE ADD PUB/PRIV BACK IN~!!!
          pub: true,
          description: that.$el.children('#descriptionInput').val(),
          parent: that.$el.children('#parentInput').val()
        };

        that.app.get('content1').show(placementView);
        that.app.get('content2').hide();
        that.app.get('mapController').placePoints();
        that.app.get('mapController').placing = true;
      }



    });



      this.$el.children('#parentInput').on('keyup', function(e) {

        var searchParameter = $('#parentInput').val();

        //SHOULD MAYBE THROTTLE THIS ???????

        if ($('#parentInput').val().length > 1) {

          $.ajax({
            url: 'http://liveworld.io:80/locationSearch',
            //url: 'http://localhost:80/channelSearch',
            data: {
              input: searchParameter,
              onlyCities: true
            },
            crossDomain: true,
            success: function(data) {
              console.log(data);
              $('.creationChannelSearchResult').remove();

              for (var i=0; i < data.length ;i++) {

                var $element = $('<div class="creationChannelSearchResult">'+data[i].name+'</div>');
                that.$el.children('#createLocationSearchContainer')
                .append($element);
                console.log(that.$el.children('#createLocationSearchContainer'));

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
      for (var key in that.app.get('mapController').get('cities')._layers) {
        if (that.app.get('mapController').get('cities')._layers[key].city === $('#parentInput').val()) {
          that.cityVerified = true;
          break;
        }
      }
      this.cityVerified = false;
    }
  }, 500);


  var $availabilityButton = that.$el.children('button#checkAvailabilityButton');
  $availabilityButton.on('click', function() {

      console.log(that.$el.children('input#parentInput').val())
    $.ajax({
      url: 'http://liveworld.io:80/validateLocation',
      // url: 'http://localhost:80/locationSearch',
      data: {
        name: that.$el.children('input#locationNameInput').val(),
        parent: that.$el.children('input#parentInput').val()
      },
      crossDomain: true,
      success: function(data) {

        if (data === 'Available') {
          alert(that.app.translate('location available :)'));
        } else {
          alert(that.app.translate(data));
        }

      },
      error: function(data) {
        console.log('ajax error');
      }
    });



  });



  },

  close: function() {
    clearInterval(this.checker);
    console.log('location creation view closing');
    this.remove();
  }

});