window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.AboutView = Backbone.View.extend({

  tagName: 'div',

  className: 'aboutView',

  initialize: function(appController) {

    this.app = appController;
    this.template = _.template( $('#aboutTemplate').html() );

  },

  render: function() {
    var that = this;

    this.$el.html( this.template() );

    this.$el.append($('<img src="/resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('content2').hide();
    };

    var label1 = this.app.translate('Welcome to Egora!');
    label1 += this.app.translate(' This site is designed to show what people are thinking about, everywhere in the world, at both large and small scales.');
    label1 += this.app.translate(' The map is used to navigate through Locations and display user activity.');
    label1 += this.app.translate(' Users navigate Egora by changing Location and Channel.');
    label1 += this.app.translate(' Users may create Posts for any combination of Location and Channel.');
    label1 += this.app.translate(' Inside each Post, users can have an organized discussion with text and images.');
    label1 += this.app.translate(' Locations and Channels can be nested, and they are organized like a tree (see picture below).');
    label1 += this.app.translate(' To get started, choose a Location and a Channel (or just hang out in World ~ All). Happy posting!');

    var label2 = this.app.translate('P.S. Egora is a portmanteau of Electronic-Agora.');
    var label3 = this.app.translate('i) Electronic as it exists in cyberspace, which is substantiated in the electronic digital computer.');
    var label4 = this.app.translate('ii) Agora as we invoke the gathering place of the ancient Greek city-states. A rich centerpiece of public life.');


    this.$el.children('#aboutSectionOne').append(label1);
    this.$el.children('#aboutSectionTwo').append(label2);
    this.$el.children('#aboutSectionThree').append(label3);
    this.$el.children('#aboutSectionFour').append(label4);



  },

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});