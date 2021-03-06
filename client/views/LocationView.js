window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.LocationView = Backbone.View.extend({

  tagName: 'div',

  className: 'locationView',


  //CAREFUL ABOUT PASSING THINGS IN, THERE'S A GHOST
  initialize: function() {
    //assigned in appController
    this.app = null;
    this.router = null;
  },




  parseLocation: function(location) {
    //returns [{ name:..., path:..}, ..]

    var result = [];

    var split = location.split('/');
    var path = '';
    for (var i=0; i < split.length ;i++) {
      if (i === 0) {
        path += split[i];
      } else {
        path += '/' + split[i];
      }
      result.push({ name: split[i], path: path })

    };
    return result;
  },




  //This pathing system is obviously broken fundamentally, I can patch it for now,
  //but eventually I will have to rebuild it.
  render: function() {
    var that = this;

    this.$el.unbind();
    this.$el.empty();

    var path = this.model.get('location').split('/');




    var searchButton = $('<img id="pathSearchButton" src="https://s3-us-west-2.amazonaws.com/agora-static-storage/search.png" width="13px" height="13px"></img>');

    searchButton.on('click', function() { 
      // that.$el.empty();
      // that.$el.append($('<span class="channelName">&nbsp&nbspLocation:&nbsp</span>'));

      // var searchButton = $('<img id="pathSearchButton" src="https://s3-us-west-2.amazonaws.com/agora-static-storage/search.png" width="13px" height="13px"></img>');

      // that.$el.append(searchButton);

      that.$el.append($('<input id="pathInput"></input>'));

      $('#pathInput').focus();
      $('#pathInput').focusout(function() {
        setTimeout(function() {
          // that.app.changeChannel('All');
          // that.app.get('mapController').showWorld();
        }, 2000);
        //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
        $('#pathInput').remove();
        //that.$el.empty();
        //that.render();
        //that.setHandlers();
      });
      
      //keyup is the best way to get all the keys, not ideal
      $('#pathInput').on('keyup', function(e) {

        var searchParameter = $('#pathInput').val();

        console.log('searchParameter: ', searchParameter);

        //SHOULD MAYBE THROTTLE THIS ???????

        if (searchParameter.length > 0) {

          $.ajax({
            url: 'http://54.202.31.15:80/locationSearch',
            // url: 'http://localhost:80/locationSearch',
            data: {
              input: searchParameter
            },
            crossDomain: true,
            success: function(data) {

              if (data) {
                that.app.get('sidebarView').searchCollection = data;
                that.app.get('sidebarView').displayed = 'Search';
                that.app.get('content1').show(that.app.get('sidebarView'));
              }

            }
          });

        } else if (searchParameter === '') {
          $('.locationSearchResult').remove();
        }

      });
    });
    this.$el.append(searchButton);



    //SUBTREE BUTTON
    this.$el.append( $('<strong><span class="pathWrapper"></span></strong>') );
    var $treeButton = $('<img class="treeButton" src="https://s3-us-west-2.amazonaws.com/agora-static-storage/treeIcon.png"></img>');
    $treeButton[0].onclick = function() {

      $.ajax({
        url: 'http://54.202.31.15:80/locationSubtree',
        // url: 'http://localhost:80/locationSubtree',
        crossDomain: true,
        method: 'GET',
        data: {
          location: that.app.get('mapController').get('location')
        },
        success: function(data) {
          if (data) {
            that.app.get('sidebarView').searchCollection = data;
            that.app.get('sidebarView').displayed = 'Search';
            that.app.get('content1').show(that.app.get('sidebarView'));

          } else {
            alert(that.app.translate('error'));
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });


    };
    this.$el.append($treeButton);




    //splitting up location and creating breadcrumb

    var parsedLocationArray = this.parseLocation(this.app.get('mapController').get('location'));

    for (var i=0; i < parsedLocationArray.length ;i++) {
      if (i===0) {  //this manages the '/' in the locationView
        var $channelElement = $('<strong><span class="channelWrapper">'+parsedLocationArray[i].name+'</span></strong>');
      } else {
        var $channelElement = $('<strong><span class="channelWrapper">/'+parsedLocationArray[i].name+'</span></strong>');
      }
      (function() {
        var x = parsedLocationArray[i].path;
        $channelElement[0].onclick = function() {

          that.app.get('mapController').goToPath(x);
          that.render();

        ;}

      })();
      $('span.pathWrapper').append( $channelElement );

    }


    //PREFIX(suffix in arabic)
    var prefix = this.app.translate('Location');

    if (this.app.get('language') !== 'ar') {
      var $prefix = $('<span id="pathPrefix">&nbsp&nbsp'+prefix+':&nbsp</span>');
      $prefix.on('click', function() {
        
        that.app.showLocationDetailView(that.model.get('location'));

      });
      this.$el.prepend($prefix);
    } else {
      var $prefix = $('<span id="pathPrefix">&nbsp:'+prefix+'&nbsp&nbsp</span>');
      $prefix.on('click', function() {
        
        that.app.showLocationDetailView(that.model.get('location'));

      });
      this.$el.append($prefix);
    }






  },


  setHandlers: function() {
    var that = this;


  },

  close: function() {
    console.log('YYOU CANNOT KILLLL PATHVIEW..');
  }

});
