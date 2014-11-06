window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//the detail view now occupies the role of wrapping the 'core' detail entry view
//less frequented views (login, place creation, etc..) will not be wrapped by the detail view,
//those entry views will be loaded into content2 directly in AppController

Agora.Views.DetailView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailView',


  initialize: function(appController) {
    this.responseBoxTemplate = _.template( $('#responseBoxTemplate').html() );
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
      that.app.get('content2').hide();
    }

    // document.getElementsByClassName('x').onclick = function() {
    //   that.app.get('content2').hide();
    // }

    // document.getElementsByClassName('x')[0].addEventListener('click', function() {
    //   that.app.get('content2').hide();
    // });






    // ## RESPONSE BOX ##
    //console.log('appending response box in render responding: ',this.responding);
    //USE this.responseData here so users won't lose their changes

    //!!!!!
    //this.$el.append(this.responseBoxTemplate());

    //##############################
    //####### RESPONSE BOX #########
    //##############################

    //MESSAGE BOX DOESN'T POST WITHIN GROUPS YET
    this.$el.children('div.responseBox').children('div#responseBoxButton').on('click', function(e) {

      var headline = that.$el.children('div.responseBox').children('textarea#responseHeadlineTextArea').val();
      var content = that.$el.children('div.responseBox').children('textarea#responseTextArea').val();
      var location = that.app.get('mapController').get('location');
      that.$el.children('div.responseBox').children('textarea').val('');
      console.log(that.responseData);

      if (that.responseData.type === 'Topic') {
        $.ajax({
          url: 'createComment',
          method: 'POST',
          data: {
            location: that.responseData.location,
            group: that.responseData.group,
            topic: that.responseData.topic,
            headline: headline,
            content: content
          },
          success: function(data) {
            alert(data);
            //append their comment anyways?
            that.app.get('mapController').trigger('reloadSidebar', location);
          },
          error: function() {
            //TODO
          }
        });
      } else if (that.responseData.type === 'Comment') {

        //TODO
        //send a response generating ajax request


      } else if (that.responseData.type === 'Response' ||
        that.responseData.type === 'Reply') {

        $.ajax({
          url: 'createReply',
          method: 'POST',
          data: {
            location: that.responseData.location,
            group: that.responseData.group,
            topic: that.responseData.topic,
            comment: that.responseData.comment,
            headline: headline,
            content: content
          },
          success: function(data) {
            alert(data);
            //append their reply
            //reload the proper sidebar
            that.app.get('mapController').trigger('reloadSidebar', location);
          },
          error: function() {
            //TODO
          }
        });

      }
    });

    this.$el.children('.responseBox').append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('.responseBox').children('img.x').on('click', function() {
      that.closeResponseBox();
    });




    if (this.responding) {
      //why do I need to use this selector?
      this.$el.children('div.responseBox').css('height', '100px');
    }




    var entryView = new Agora.Views.DetailTopicEntryView(this.app);
    entryView.model = model;
    entryView.render();
    this.$el.append(entryView.$el);
    this.view = entryView;


  }, 




  renderMessage: function(model) {

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
    entryView.render();
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

  openResponseBox: function(data) {
    console.log('reposneto: ', data);
    this.responding = true;
    this.responseData = data;
    $('textarea#responseTextArea').val('');
    if (data.type === 'Reply') {
      $('textarea#responseTextArea').val('@'+data.username);
    }
    $('.responseBox').css('height', '100px');
  },

  //for selecting different replies/comments/topics
  respondTo: function(data) {

  },

  closeResponseBox: function() {
    //why lol
    this.responding = false;
    $('.responseBox').css('height', '0px');

  },




});
