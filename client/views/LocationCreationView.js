window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.LocationCreationView = Backbone.View.extend({

  //need to reflect the change in the rest of the file

  tagName: 'div',

  className: 'groupCreationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#creationTemplate').html() );
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

    // this.$el.append( $('<button>Next</button>') );

  },

  setHandlers: function() {
    var that = this;
    this.$el.children('button').on('click', function() {

      // pass the info along to placementView so we can
      //make the ajax call from there
      // $.ajax({
      //   url: 'createGroup',
      //   method: 'POST',
      //   data: {
      //     location: that.app.get('mapController').get('location'),
      //     latitude: 47.6097,
      //     longitude: -122.3331,
      //     name: 'voodoo',
      //     description: 'magiks',
      //     public: true,
      //     open: true
      //   },
      //   success: function() {
      //     alert('heyo');
      //   },
      //   error: function() {
      //     alert('well shoot');
      //   }

      // });

      console.log(that.$el.children('input:radio[name=public]').val());

      var placementView = new Agora.Views.PlacementView(that.app);
      placementView.data = {
        name: that.$el.children('input').val(),
        description: that.$el.children('textarea').val(),
        public: true,
        open: true
      };
      that.app.get('mapController').placePoints();
      that.app.get('content1').show(placementView);
      that.app.get('content2').hide();


    });

  },

  close: function() {
    console.log('group creation view closing');
    this.remove();
  }

});