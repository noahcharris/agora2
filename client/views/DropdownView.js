window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DropdownView = Backbone.View.extend({

  tagName: 'div',

  id: 'dropdownView',

  initialize: function(appController) {
    this.app = appController;
    //filters the content (top, new, favorites, etc...)
    this.filter = 'Top';
  },


  render: function() {
    this.$el.html( 'DROPD WON MRNFY');

    // var that = this;
    // this.$el.append($('<p class="x">X</p>'));
    // this.$el.children('p.x').on('click', function() {
    //   that.app.get('dropdownView').hide();
    // });

  },



  show: function() {
    $('#dropdownView').css('height', '100px');
  },

  hide: function() {
    $('#dropdownView').css('height', '0px');
  }



});