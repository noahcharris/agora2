window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.ChannelView = Backbone.View.extend({

  tagName: 'div',

  className: 'channelView',

  //CAREFUL ABOUT PASSING THINGS IN, THERE'S A GHOST
  //wtf am I talking about
  initialize: function() {
    //assigned in appController
    this.app = null;
    this.router = null;
  },


  parseChannel: function(channel) {

    var result = [];

    var split = channel.split('/');
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


  render: function() {
    var that = this;

    this.$el.unbind();
    this.$el.empty();


    var channel = this.app.get('channel');



    var searchButton = $('<img id="channelSearchButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

    searchButton.on('click', function() { 

      that.$el.append($('<input id="channelInput"></input>'));

      $('#channelInput').focus();
      $('#channelInput').focusout(function() {
        //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
        setTimeout(function() {
          // that.app.changeChannel('All');
          // that.app.get('mapController').showWorld();
        }, 2000);
        $('#channelInput').remove();
        // $('.channelView').empty();
        // setTimeout(function() { that.render(); }, 100);
        // that.setHandlers();
      });
      //keyup is the best way to get all the keys, not ideal
      $('#channelInput').on('keyup', function(e) {

        var searchParameter = $('#channelInput').val();

        //SHOULD MAYBE THROTTLE THIS ???????

        if ($('#channelInput').val().length > 0) {

          $.ajax({
            url: 'http://egora.co:80/channelSearch',
            //url: 'http://localhost:80/channelSearch',
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
          $('.channelSearchResult').remove();
        }




        //AJAX CALL FOR SEARCH SUGGESTIONS
        //throttle the ajax call here
       });
    });
    this.$el.append(searchButton);



    //NEED TO SPLIT UP THE CHANNEL HERE AND CREATE A BREADCRUMB

    var parsedChannelArray = this.parseChannel(this.app.get('channel'));

    for (var i=0; i < parsedChannelArray.length ;i++) {
      if (i===0) {  //this manages the '/' in the channelView
        var $channelElement = $('<strong><span class="channelWrapper">'+parsedChannelArray[i].name+'</span></strong>');
      } else {
        var $channelElement = $('<strong><span class="channelWrapper">/'+parsedChannelArray[i].name+'</span></strong>');
      }
      (function() {
        var x = parsedChannelArray[i].path;
        $channelElement[0].onclick = function() {

          that.app.get('sidebarView').displayed = 'Topics-Top';
          that.app.changeChannel(x);
          that.render();
          that.app.trigger('reloadSidebarTopics');

        ;}

      })();
      this.$el.append( $channelElement );

    }









    var $treeButton = $('<img class="treeButton" src="/resources/images/treeIcon.png"></img>');
    $treeButton.on('click', function() {




      $.ajax({
        url: 'http://egora.co:80/channelSubtree',
        //url: 'http://localhost:80/channelSubtree',
        crossDomain: true,
        method: 'GET',
        data: {
          channel: that.app.get('channel')
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
          console.log(that.app.translate('server error'));
        }

      });







    });
    this.$el.append($treeButton);





    //PREFIX (suffix in arabic)
    var prefix = this.app.translate('Channel');

    if (this.app.get('language') !== 'ar') {
      var $prefix = $('<span class="channelName">&nbsp&nbsp'+prefix+':&nbsp</span>')
      $prefix.on('click', function() {
        
        that.app.showChannelDetailView(that.app.get('channel'));

      });
      this.$el.prepend($prefix);
    } else {
      var $prefix = $('<span class="channelName">:&nbsp'+prefix+'&nbsp&nbsp</span>')
      $prefix.on('click', function() {
        
        that.app.showChannelDetailView(that.app.get('channel'));

      });
      this.$el.append($prefix);
    }






  },





  setHandlers: function() {

    var that = this;


  }



});