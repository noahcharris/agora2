window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//goes in content1
Agora.Views.PlacementView = Backbone.View.extend({

  tagName: 'div',

  className: 'placementView',

  initialize: function(appController) {
    this.placementTemplate = _.template( $('#placementViewTemplate').html() );

    this.app = appController;

    //data default
    this.data = {};
  },

  render: function() {
    var placementLabel = this.app.translate('Place a point! Click Done when finished.');
    var doneLabel = this.app.translate('Done!');
    this.$el.html( this.placementTemplate( {placementLabel: placementLabel, doneLabel: doneLabel} ) );
  },

  setHandlers: function() {
    var that = this;

    $('#pointPlacedButton').on('click', function() {


        if (!$('.g-recaptcha-response').val()) {
          alert('Please fill out captcha');
        } else if (!that.app.get('mapController').placedLatitude) {
          alert('Please place a point on the map.')
        } else {

              $.ajax({
                url: 'https://liveworld.io:443/createLocation',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true
                },
                method: 'POST',
                data: {

                  username: that.app.get('username'),
                  token: that.app.get('token'),
                  name: that.data.name,
                  description: that.data.description,
                  parent: that.data.parent,
                  pub: that.data.pub,
                  creator: that.app.get('username'),
                  longitude: that.app.get('mapController').placedLongitude,
                  latitude: that.app.get('mapController').placedLatitude,
                  responseString = $('.g-recaptcha-response').val()

                },
                success: function(data) {
                  if (data) {
                    alert(data);
                    // topicsCollection = data;
                    // console.log('server returned: ', data);
                    // //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
                    // sidebarView.collection = data;
                    // content1.show(sidebarView);
                    that.app.get('mapController').placing = false;
                    that.app.get('mapController').stopPlacing();
                    that.app.get('content2').hide();
                    that.app.get('sidebarView').displayed = 'Topics-Top';
                    that.app.set('channel', 'All');
                    that.app.get('mapController').showWorld();
                    //that.app.get('mapController').goToPath(that.data.parent+'/'+that.data.name);



                  } else {
                    // console.log('memcached returned false');
                    // sidebarView.collection = defaultCollection;
                    // content1.show(sidebarView);
                    that.app.get('content2').hide(); 

                  }
                }, 
                error: function(err) {
                  console.log('ajax error ocurred: ', err);
                }

              });


        }//end verification ifelse



      });



  },

  close: function() {
    this.remove();
    this.app.get('mapController').placing = false;
  }

});