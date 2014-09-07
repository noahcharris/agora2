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
    this.$el.append($('<span class="channelName">&nbsp&nbspChannel:&nbsp' + channel + '&nbsp</span>'));

  }



});