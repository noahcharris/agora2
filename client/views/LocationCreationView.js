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

      if (!that.cityVerified) {
        alert('You must choose a valid parent city.');
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
          pub: pub,
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
      for (var key in that.app.get('mapController').get('cities')._layers) {
        if (that.app.get('mapController').get('cities')._layers[key].city === $('#parentInput').val()) {
          that.cityVerified = true;
          break;
        }
      }
      this.cityVerified = false;
    }
  }, 500);



  },

  close: function() {
    clearInterval(this.checker);
    console.log('location creation view closing');
    this.remove();
  }

});