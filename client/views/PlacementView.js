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

      // pass the info along to placementView so we can
      //make the ajax call from there
      $.ajax({
        url: 'createGroup',
        method: 'POST',
        data: {
          location: that.app.get('mapController').get('location'),
          latitude: that.app.get('mapController').placedLatitude,
          longitude: that.app.get('mapController').placedLongitude,
          name: that.data.name,
          description: that.data.description,
          public: that.data.public,
          open: that.data.open
        },
        success: function() {
          that.app.get('mapController').stopPlacing();
          that.app.get('alertView').mode ='GroupCreationSuccess';
          that.app.get('content2').show(that.app.get('alertView'));
        },
        error: function() {
          alert('well shoot');
        }

      });

      var emailInviteView = new Agora.Views.EmailInviteView(that.app);
      that.app.get('content2').show(emailInviteView);


    });
  },

  close: function() {
    this.remove();
    this.app.get('mapController').placing = false;
  }

});