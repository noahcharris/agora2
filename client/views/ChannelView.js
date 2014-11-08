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
    var searchButton = $('<img id="searchChannelButton" src="/resources/images/search.png" width="13px" height="13px"></img>');

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

    var $treeButton = $('<img class="treeButton" src="/resources/images/treeIcon.png"></img>');
    $treeButton.on('click', function() {

      //TODO: add subchennal code here

      console.log('woooooooooô');
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