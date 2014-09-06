window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//SidebarView uses a TopicCollection as it's collection, which can be used with both the sidebar and main discussion page
//These might be split up later down the line

Agora.Views.SidebarView = Backbone.View.extend({

  tagName: 'div',

  className: 'sidebarView',


  initialize: function(appController) {
    this.app = appController;
    this.subViews = [];     //store subviews in here so we can close them on navigation
    //indicates what model type is being displayed
    this.displayed = 'Topics';
    //indicates how we are displaying topics in topic mode
    this.topicFilter = 'Top';
    //indicates whether messages or contacts are being displayed in inbox mode
    this.inboxFilter = 'Messages';
    this.highlighted = 0;
  },


  highlightCell: function(offset) {
    //offset is generated by detail view
    var count = 0;
    for (var i=0;i<this.subViews.length;i++) {
      if (this.subViews[i].$el.hasClass('highlight')) {
        this.subViews[i].$el.removeClass('highlight');
      }
      if (count === offset) {
        this.subViews[i].$el.addClass('highlight');
      }
      count++;
    }
  },

  removeHighlights: function() {
    for (var i=0;i<this.subViews.length;i++) {
      if (this.subViews[i].$el.hasClass('highlight')) {
        this.subViews[i].$el.removeClass('highlight');
      }
    }
  },


  render: function() {

    var that = this;

    this.$el.empty();

    _.each(this.subViews, function(subView) {
      subView.close();
    });
    this.subViews = [];

      console.log('rendering sidebarView for collection type: ', this.displayed);
    
    //GOING TO USE goToPath TO BREAK OUT OF SEARCH ('All')
    if (this.displayed === 'Topics' ) {

      //hmmmm, is this necessary, how are we grouping the topics sent back from the server?
      //should we have like topics-hot, topics-new... for the this.displayed values?
      this.$el.append($('<div class="leftThirdButton" id="topButton"><span class="tabLabel">Top</span></div>'));
      this.$el.append($('<div class="middleThirdButton" id="newButton"><span class="tabLabel">New</span></div>'));
      this.$el.append($('<div class="rightThirdButton" id="hotButton"><span class="tabLabel">Hot</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Topic</span></div>'));

    } else if (this.displayed === 'All') {
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      //display 'results:'?

    } else if (this.displayed === 'Messages') {
      this.$el.append($('<div class="leftHalfButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightHalfButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    } else if (this.displayed === 'Contacts') {
      this.$el.append($('<div class="leftHalfButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightHalfButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.children('div.leftHalfButton').css('background-color','#E8E8E8');
      this.$el.children('div.rightHalfButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    }


    //########################################################
    //GOING TO TRANSITION TO THIS



    // INCLUDE PAGINATION HERE



    var renderCollection;
    var entryViewType;

    //this code is brilliant, I need to use this more often
    if (this.displayed === 'Topics') {
      renderCollection = this.collection;
    } else if (this.displayed === 'All') {
      renderCollection = this.searchCollection;
    } else if (this.displayed === 'Messages') {
      renderCollection = this.messagesCollection;
    } else if (this.displayed === 'Contacts') {
      renderCollection = this.usersCollection;
    }

    if (renderCollection) {

      _.each(this.subViews, function(subView) {
        subView.close();
      });
      this.subViews = [];

      _.each(renderCollection.models, function(model) {

        console.log('model: ', model);

        //the only difference between these is the type of entryView instantiated
        var entryViewMethod;
        if (model.type === 'Topic') {
          entryViewMethod = 'renderTopic';
        } else if (model.type === 'Place') {
          entryViewMethod = 'renderPlace';
        } else if (model.type === 'Message') {
          entryViewMethod = 'renderMessage';
        } else if (model.type === 'User') {
          entryViewMethod = 'renderUser';
        }

          var entryView = new Agora.Views.SidebarEntryView({ model: model });
          entryView[entryViewMethod]();



          //#######################################
          //####### ENTRYVIEW CLICK EVENT #########
          //#######################################



          //clicking entryView affects contetn2
          entryView.on('click', function(id, type) {
            console.log('clicked sidebar entryView with id: ', id, 'type: ', type);
  
            //#############################################
            //this is where we set content2 to a single display for the sidebar item type

            that.app.get('content2').show(that.app.get('detailView'));
            that.app.get('detailView')[entryViewMethod](model);
            that.removeHighlights();
            this.$el.addClass('highlight');
          });





        that.$el.children('ul').append(entryView.$el);
        that.subViews.push(entryView);
      });

    };

  },




  setHandlers: function() {


    // (!!!!!!!!) NEED TO SET THE HANDLERS FOR groupTopicsButton and subgroupsButton AND BACK BUTTON


    //can't just call this.render, have to put self through content1

    //TOP/NEW/HOT
    var that = this;
    $('#topButton').on('click', function() {
      if (that.topicFilter !== 'Top') {

        //need to trigger a reload here 
        that.app.trigger('whoa');
        that.topicFilter = 'Top';
        that.app.get('content1').show(that);
      }
      $('.leftThirdButton').css('background-color', '#f8f8f8');
      $('.middleThirdButton').css('background-color', '#E8E8E8');
      $('.rightThirdButton').css('background-color', '#E8E8E8');
    });

    $('#newButton').on('click', function() {
      if (that.topicFilter !== 'New') {

        //need to trigger a reload here 
        that.app.trigger('whoa');
        that.topicFilter = 'New';
        that.app.get('content1').show(that);
      }
      $('.leftThirdButton').css('background-color', '#E8E8E8');
      $('.middleThirdButton').css('background-color', '#f8f8f8');
      $('.rightThirdButton').css('background-color', '#E8E8E8');
    });

    $('#hotButton').on('click', function() {
      if (that.topicFilter !== 'Hot') {

        //need to trigger a reload here 
        that.app.trigger('whoa');
        that.topicFilter = 'Hot';
        that.app.get('content1').show(that);
      }
      $('.leftThirdButton').css('background-color', '#E8E8E8');
      $('.middleThirdButton').css('background-color', '#E8E8E8');
      $('.rightThirdButton').css('background-color', '#f8f8f8');
    });


    //MESSAGES/CONTACTS
    $('#messagesButton').on('click', function() {
      if (that.displayed !== 'Messages') {
        that.displayed = 'Messages';
        that.app.get('content1').show(that);
      }
      $('.leftHalfButton').css('background-color', '#f8f8f8');
      $('.rightHalfButton').css('background-color', '#E8E8E8');
    });

    $('#contactsButton').on('click', function() {
      if (that.displayed !== 'Contacts') {
        that.displayed = 'Contacts';
        that.app.get('content1').show(that);
      }
      $('.leftHalfButton').css('background-color', '#E8E8E8');
      $('.rightHalfButton').css('background-color', '#f8f8f8');
    });








    //UNDER CONSTRUCTION

    $('#creationButton').on('click', function() {
       if (that.app.get('sidebarView').displayed === 'Topics'
        || that.app.get('sidebarView').displayed === 'GroupTopics'
        || that.app.get('sidebarView').displayed === 'SubgroupTopics') {

        var topicCreation = new Agora.Views.TopicCreationView(that.app);

        if (!that.app.get('expanded')) {

          //Using callback with content2
          that.app.get('content2').show(topicCreation, function() {
            console.log('clicked create, topics mode');
          });
        } else {

          //assuming that if it's expanded it has a classname
          if ($('#content2').children()[0].className !== 'topicCreationView') {

            that.app.get('content2').show(topicCreation);
          }
          console.log('clicked create, topics mode');
        }

      } else if (that.app.get('sidebarView').displayed === 'Groups') {

        //careful with instantiating these on demand, make sure they are being GC'd
        var groupCreation = new Agora.Views.GroupCreationView(that.app);

        if (!that.app.get('expanded')) {

          that.app.get('content2').show(groupCreation, function() {
            //that.app.get('content2').show(groupCreation);
            console.log('hey');
          });
        } else {

          //assuming that if it's expanded it has a classname
          if ($('#content2').children()[0].className !== 'groupCreationView') {

            that.app.get('content2').show(groupCreation);
          }
          console.log('clicked create, groups mode');
        }


      } else if (that.app.get('sidebarView').displayed === 'Subgroups') {
        alert('create subgroup!');
      }
    });


  },


  close: function() {
    _.each(this.subViews, function(subView) {
      subView.close();
    });
    this.subViews = [];
    this.remove();
  }

});
