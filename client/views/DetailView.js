window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//the detail view now occupies the role of wrapping the 'core' detail entry view
//less frequented views (login, place creation, etc..) will not be wrapped by the detail view,
//those entry views will be loaded into content2 directly in AppController

Agora.Views.DetailView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailView',


  initialize: function(appController) {
    this.app = appController;

    //!!!!!hopefully this will help to solve the problems with rendering detailView shit
    this.displayed = 'Topics';

    //response box variables
    this.responding = false;
    this.view = null;
  },

  render: function() {
    console.log('something called render on DetailView, but all this does is nothing');

    // this.$el.empty();
    // if (this.view) {
    //   this.view.close();
    // }
    //wow so I guess backbone defaults to renderTopic if 
    //render() is called and there is no render method
  },



  renderTopic: function(model) {

    var that = this;
    this.$el.empty();

    var $x = $('<img src="resources/images/x.png" class="x"></img>')


    this.$el.append( $x );

    // $x.on('click', function() {
    //   console.log('ugh');
    //   that.app.get('content2').hide();
    // });

    //this one appears to work much better than the one above, why is that?
    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('sidebarView').removeHighlights();
      that.app.get('content2').hide();
    }

    // document.getElementsByClassName('x').onclick = function() {
    //   that.app.get('content2').hide();
    // }

    // document.getElementsByClassName('x')[0].addEventListener('click', function() {
    //   that.app.get('content2').hide();
    // });



    var entryView = new Agora.Views.DetailTopicEntryView(this.app);
    entryView.model = model;
    entryView.render();
    this.$el.append(entryView.$el);
    this.view = entryView;


  }, 




  renderMessage: function(model, model2) {

    console.log('rendering message with model: ', model);

    var that = this;
    this.$el.empty();
    if (this.view) {
      this.view.close();
    }

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('content2').hide();
      console.log('closing detailview');
    };

    var entryView = new Agora.Views.DetailMessageEntryView(this.app);
    entryView.model = model;
    this.$el.append(entryView.$el);
    entryView.render(model2);
    this.view = entryView;
  
  },

  renderUser: function(model) {

    var that = this;
    this.$el.empty();
    if (this.view) {
      this.view.close();
    }

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('content2').hide();
      console.log('closing detailview');
    };

    var entryView = new Agora.Views.DetailUserEntryView(this.app);
    entryView.model = model;
    entryView.render();
    this.$el.append(entryView.$el);
    this.view = entryView;

  },

  renderPlace: function(model) {

    var that = this;
    this.$el.empty();
    if (this.view) {
      this.view.close();
    }

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
      console.log('closing detailview');
    });

    var entryView = new Agora.Views.DetailPlaceEntryView(this.app);
    entryView.model = model;
    entryView.render();
    this.$el.append(entryView.$el);
    this.view = entryView;

  },



  //###################################



  close: function() {
    this.app.get('sidebarView').removeHighlights();
    //this.closeResponseBox();
    if (this.view) {
      this.view.close();
    }
    this.$el.empty();
  },



});
