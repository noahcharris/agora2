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
    console.log('rendering channelView with channel: ', channel);
    this.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp<strong>' + channel + '</strong>&nbsp</span>'));

  },

  setHandlers: function() {

    var that = this;
    console.log('mah dick');
    console.log($('.channelView'));
    $('.channelView').on('click', function(e) {
      console.log('hey');
      console.log(e);
      that.$el.empty();
      that.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp<input id="channelInput"></input></span>'));
      $('#channelInput').focus();
      $('#channelInput').focusout(function() {
        //REMEMBER TO CALL BOTH RENDER AND SETHANDLERS
        $('.channelView').empty();
        that.render();
        that.setHandlers();
      });
      //keyup is the best way to get all the keys, not ideal
      $('#channelInput').on('keyup', function(e) {
        console.log($('#channelInput').val());
        //AJAX CALL FOR SEARCH SUGGESTIONS
      });
    });

  }



});