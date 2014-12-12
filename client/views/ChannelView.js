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

    //TODO- Preston's suggestion, give it click interaction with searchability

    var channel = this.app.get('channel');

    //PREFIX

    var $prefix = $('<span class="channelName">&nbsp&nbspChannel:&nbsp</span>')
    $prefix.on('click', function() {
      console.log('hohowehowh');
    });
    this.$el.append($prefix);

    var searchButton = $('<img id="channelSearchButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

    searchButton.on('click', function() { 
      // that.$el.empty();
      // that.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp</span>'));

      // var searchButton = $('<img id="searchChannelButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

      // that.$el.append(searchButton);

      that.$el.append($('<input id="channelInput"></input>'));

      $('#channelInput').focus();
      $('#channelInput').focusout(function() {
        //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
        $('#channelInput').remove();
        // $('.channelView').empty();
        // setTimeout(function() { that.render(); }, 100);
        // that.setHandlers();
      });
      //keyup is the best way to get all the keys, not ideal
      $('#channelInput').on('keyup', function(e) {

        var searchParameter = $('#channelInput').val();

        //SHOULD MAYBE THROTTLE THIS ???????

        if ($('#channelInput').val().length > 2) {

          $.ajax({
            url: 'http://54.149.63.77:80/channelSearch',
            //url: 'http://localhost:80/channelSearch',
            data: {
              input: searchParameter
            },
            crossDomain: true,
            success: function(data) {
              console.log(data);
              $('.channelSearchResult').remove();

              var cssAdjust = -30;
              for (var i=0; i < data.length ;i++) {

                var $element = $('<div class="channelSearchResult">'+data[i].name+'</div>');
                that.$el.append($element);



                (function() {
                  var x = data[i].name;
                  $element.on('click', function(e)  {


                    console.log('hi');

                    that.app.set('channel', x);
                    that.app.trigger('reloadSidebarTopics', that.app.get('mapController').get('location'));
                    that.render();


                  });
                  
                })();



                $element.css('bottom', cssAdjust + 'px');

                cssAdjust -= 30;

                
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

        ;}

      })();
      this.$el.append( $channelElement );

    }









    var $treeButton = $('<img class="treeButton" src="/resources/images/treeIcon.png"></img>');
    $treeButton.on('click', function() {




      $.ajax({
        url: 'http://54.149.63.77:80/channelSubtree',
        //url: 'http://localhost:80/channelSubtree',
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

                  that.app.changeChannel(x.name);
                  that.render();

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