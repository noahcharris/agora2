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
    this.$el.children('#nextButton').on('click', function() {


      console.log('RADIO INPUT : ', that.$el.children('input:radio[name=public]').val());

      var pub = true;;
      if (that.$el.children('input:radio[name=public]').val() === 'public') {
        pub = true;
      } else {
        pub = false;
      }

      var placementView = new Agora.Views.PlacementView(that.app);

      placementView.data = {
        name: that.$el.children('#locationNameInput').val(),
        pub: pub,
        description: that.$el.children('#descriptionInput').val(),
        parent: that.$el.children('#parentInput').val()
      };

      that.app.get('mapController').placePoints();
      that.app.get('content1').show(placementView);
      that.app.get('content2').hide();


    });

  },

  close: function() {
    console.log('location creation view closing');
    this.remove();
  }

});