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
    this.$el.html(this.placementTemplate());
  },

  setHandlers: function() {
    var that = this;

    $('#pointPlacedButton').on('click', function() {


        console.log('LONGTIDUE: ', that.app.get('mapController').placedLongitude);

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
            latitude: that.app.get('mapController').placedLatitude

          },
          success: function(data) {
            if (data) {
              alert(data);
              // topicsCollection = data;
              // console.log('server returned: ', data);
              // //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
              // sidebarView.collection = data;
              // content1.show(sidebarView);
              that.app.get('content2').hide();
              that.app.get('sidebarView').displayed = 'Topics-Top';
              that.app.get('content1').show(that.app.get('sidebarView')); 
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


      });



  },

  close: function() {
    this.remove();
    this.app.get('mapController').placing = false;
  }

});