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


  render: function() {
    var that = this;

    //TODO- Preston's suggestion, give it click interaction with searchability

    var channel = this.app.get('channel');
    this.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp</span>')); //<strong>' + channel + '</strong>&nbsp</span>'));
    var searchButton = $('<img id="channelSearchButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

    searchButton.on('click', function() { 
      that.$el.empty();
      that.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp</span>'));

      var searchButton = $('<img id="searchChannelButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

      searchButton.on('click', function() { alert('mah dick'); });
      that.$el.append(searchButton);

      that.$el.append($('<input id="channelInput"></input>'));

      $('#channelInput').focus();
      $('#channelInput').focusout(function() {
        //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
        $('.channelView').empty();
        that.render();
        that.setHandlers();
      });
      //keyup is the best way to get all the keys, not ideal
      $('#channelInput').on('keyup', function(e) {

        var searchParameter = $('#channelInput').val();
        $.ajax({
          url: 'http://localhost:8080/channelSearch',
          data: {
            query: searchParameter
          },
          crossDomain: true,
          success: function(data) {
            console.log(data);
            $('#channelSearchResultList').remove();
            if ($('#channelInput').val() != '') {
              that.$el.append($('<div id="channelSearchResultList">WOOOOOO</div>'));
            }
          }
        });




        //AJAX CALL FOR SEARCH SUGGESTIONS
        //throttle the ajax call here
       });
    });
    this.$el.append(searchButton);



    this.$el.append( $('<strong><span class="channelWrapper">General</span></strong>') );

    var $treeButton = $('<img class="treeButton" src="/resources/images/treeIcon.png"></img>');
    $treeButton.on('click', function() {




      $.ajax({
        url: 'http://localhost:80/channelSubtree',
        crossDomain: true,
        method: 'GET',
        data: {
          channel: that.app.get('channel')
        },
        success: function(data) {
          if (data) {
            console.log('DATA: ', data);
            $subtreeView = $('<div id="channelSubtreeView">Subpaths</div>');
            $subtreeView.on('click', function() {
              $(this).remove();
            });
            for (var i=0; i < data.length ;i++) {

              var $subtree = $('<p>'+data[i].name+'</p>');

              var f = function() {
                var x = data[i];
                $subtree[0].onclick = function() {
                  // that.app.get('mapController').set('location', data[i]);
                  // that.app.trigger('reloadSidebarTopics', data[i]);
                  // that.router.navigate('World/'+data[i], { trigger:false });
                  
                  console.log(x);

                  //WHATVER THE CHANNEL EQUIVALENT OF goToPath is goes here!!!!!

                  //that.app.get('mapController').goToPath(x);
                };
              };
              f();
              $subtreeView.append($subtree);

            }

            that.$el.append($subtreeView);

          } else {
            alert('error');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });







    });
    this.$el.append($treeButton);

  },

  setHandlers: function() {

    var that = this;

    // $('.channelView').on('click', function(e) {
    //   that.$el.empty();
    //   that.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp</span>'));

    //   var searchButton = $('<img id="searchChannelButton" src="/resources/images/search.png" width="10px" height="10px"></img>');

    //   searchButton.on('click', function() { alert('mah dick'); });
    //   that.$el.append(searchButton);

    //   that.$el.append($('<input id="channelInput"></input>'));

    //   $('#channelInput').focus();
    //   $('#channelInput').focusout(function() {
    //     //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
    //     $('.channelView').empty();
    //     that.render();
    //     that.setHandlers();
    //   });
    //   //keyup is the best way to get all the keys, not ideal
    //   $('#channelInput').on('keyup', function(e) {
    //     console.log($('#channelInput').val());
    //     //AJAX CALL FOR SEARCH SUGGESTIONS
    //     //throttle the ajax call here
    //   });
    // });

  }



});