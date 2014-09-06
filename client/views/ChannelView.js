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
    console.log('rendering channelView');
    this.$el.append($('<span class="channelName">Channel:&nbsp</span>'));
  }



});