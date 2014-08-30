window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.PathView = Backbone.View.extend({

  tagName: 'div',

  className: 'pathView',


  //CAREFUL ABOUT PASSING THINGS IN, THERE'S A GHOST
  initialize: function() {
    //assigned in appController
    this.app = null;
    this.router = null;
  },


  //This pathing system is obviously broken fundamentally, I can patch it for now,
  //but eventually I will have to rebuild it.
  render: function() {
    var that = this;

    var path = this.model.get('location').split('/');
    if (this.model.get('group')) {
      var group = this.model.get('group').split('/');
    }

    // var $dropButton = $('<button>DROP</button>');
    // var collapsed = true;
    // $dropButton.on('click', function() {
    //   if (collapsed) {
    //     that.app.get('dropdownView').show();
    //     collapsed = false;
    //   } else {
    //     that.app.get('dropdownView').hide();
    //     collapsed = true;
    //   }
    // });

    //this.$el.html( $dropButton );
    this.$el.html( $('<span id="hello">&nbsp&nbspHello:</span>') );
    this.$el.append( $('<strong><span class="pathWrapper"></span></strong>') );

    var $world = $('<span class="pathName">World</span>')
    $world.on('click', function() {
      that.app.get('mapController').showWorld();
    })
    $('span.pathWrapper').append($world);

    if (path.length > 0 && path[0] !== '') {
      var $country = $('<span class="pathName">/'+path[0]+'</span>');
      $country.on('click', function() {
        that.app.get('mapController').goToPath(path[0]);
        that.router.navigate('World/'+path[0], {trigger: false});
      });
      $('span.pathWrapper').append($country);
    //Need to check against a list of the countries that have been
    //divided into 'states' instead of just hardcoding it..
    } 

    if (path.length > 1 && path[0] === 'United States') {
      var $state = $('<span class="pathName">/'+path[1]+'</span>');
      $state.on('click', function() {
        that.app.get('mapController').goToPath(path[0]+'/'+path[1]);
        that.router.navigate('World/'+path[0]+'/'+path[1], {trigger: false});
      });
      $('span.pathWrapper').append($state);
    } else if (path.length > 1) {
      var $city = $('<span class="pathName">/'+path[1]+'</span>');
      $city.on('click', function() {
        that.app.get('mapController').goToPath(path[0]+'/'+path[1]);
        that.router.navigate('World/'+path[0]+'/'+path[1], {trigger: false});
      });
      $('span.pathWrapper').append($city);
    } 

    if (path.length > 2) {
      var $city = $('<span class="pathName">/'+path[2]+'</span>');
      $city.on('click', function() {
        that.app.get('mapController').goToPath(path[0]+'/'+path[1]+'/'+path[2]);
        that.router.navigate('World/'+path[0]+'/'+path[1]+'/'+path[2], {trigger: false});
      });
      $('span.pathWrapper').append($city);
    }


    if (this.model.get('group')) {
      if (group[0]) {
        var $group = $('<span class="pathName">'+group[0]+'</span>');
        $group.on('click', function() {
          that.app.get('mapController').goToPath(that.app.get('mapController').get('location')+'~'+group[0]);
          that.router.navigate('World/'+that.model.get('location')+'~'+group[0], {trigger: false});
        });
        $('span.pathWrapper').append('~ ').append($group);
      }

      if (group.length > 1) {
        var $subgroup = $('<span class="pathName">/'+group[1]+'</span>');
        $subgroup.on('click', function() {
          that.app.get('mapController').goToPath(that.app.get('mapController').get('location')+'~'+group[0]+'/'+group[1]);
          that.router.navigate('World/'+that.model.get('location')+'~'+group[0]+'/'+group[1], {trigger: false});

        });
        $('span.pathWrapper').append($subgroup);
      }
    }
  },


  setHandlers: function() {
    var that = this;
    $('#hello').on('click', function() {
      $.ajax({
        url: 'place',
        method: 'GET',
        data: {
          location: that.app.get('mapController').get('location')
        },
        success: function(data) {
          console.log(data);
          that.app.get('placeView').model = data[0];
          if (!that.app.get('expanded')) {
            that.app.get('content2').show(that.app.get('placeView'));
          } else {
            if ($('#content2').children()[0].className === 'placeView') {
              content2.hide();
            } else {
              content2.show(that.app.get('placeView'));
            }
          }
        },
      })


      //will have to retrieve location data and then load up the placeview
      //use a lockout variable so only one request is sent

    });
  },

  close: function() {
    console.log('YYOU CANNOT KILLLL PATHVIEW..');
  }

});
