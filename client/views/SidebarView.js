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
    //NEED TO CHANGE this.topics everywhere to an enumeration of
    //topics/groups/all
    this.displayed = 'Topics'
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

      console.log('render sidebarView with: ', this.displayed);
    
    //GOING TO USE goToPath TO BREAK OUT OF SEARCH ('All')
    if (this.displayed === 'Topics' ) {
      this.$el.append($('<div class="leftButton" id="topicsButton"><span class="tabLabel">Topics</span></div>'));
      this.$el.append($('<div class="rightButton" id="groupsButton"><span class="tabLabel">Groups</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Topic</span></div>'));
    } else if (this.displayed === 'Groups') {
      this.$el.append($('<div class="leftButton" id="topicsButton"><span class="tabLabel">Topics</span></div>'));
      this.$el.append($('<div class="rightButton" id="groupsButton"><span class="tabLabel">Groups</span></div>'));
      //change the colors here if starting out with groups selected
      this.$el.children('div.leftButton').css('background-color','#E8E8E8');
      this.$el.children('div.rightButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Group</span></div>'));
    } else if (this.displayed === 'All') {
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      //display 'results:'?
    } else if (this.displayed === 'GroupTopics') {
      this.$el.append($('<div class="leftButton" id="groupTopicsButton"><span class="tabLabel">Topics</span></div>'));
      this.$el.append($('<div class="rightButton" id="subgroupsButton"><span class="tabLabel">Subgroups</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Topic</span></div>'));
    } else if (this.displayed === 'Subgroups') {
      this.$el.append($('<div class="leftButton" id="groupTopicsButton"><span class="tabLabel">Topics</span></div>'));
      this.$el.append($('<div class="rightButton" id="subgroupsButton"><span class="tabLabel">Subgroups</span></div>'));
      //change the colors here if starting out with groups selected
      this.$el.children('div.leftButton').css('background-color','#E8E8E8');
      this.$el.children('div.rightButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Subgroup</span></div>'));
    } else if (this.displayed === 'SubgroupTopics') {
      this.$el.append($('<div class="leftButton" id="backButton"><span class="tabLabel">Back</span></div>'));
      //set the backbutton color like this because we want it to look unclicked
      this.$el.children('div.leftButton').css('background-color','#E8E8E8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Topic</span></div>'));
    } else if (this.displayed === 'Messages') {
      this.$el.append($('<div class="leftButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    } else if (this.displayed === 'Contacts') {
      this.$el.append($('<div class="leftButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.children('div.leftButton').css('background-color','#E8E8E8');
      this.$el.children('div.rightButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    }



    // INCLUDE PAGINATION HERE



    var renderCollection;
    var entryViewType;

    //this code is brilliant, I need to use this more often
    if (this.displayed === 'Topics') {
      renderCollection = this.collection;
    } else if (this.displayed === 'Groups') {
      renderCollection = this.groupsCollection;
    } else if (this.displayed === 'GroupTopics') {
      renderCollection = this.groupTopicsCollection;
    } else if (this.displayed === 'Subgroups') {
      renderCollection = this.subgroupsCollection;
    } else if (this.displayed === 'SubgroupTopics') {
      renderCollection = this.subgroupTopicsCollection;
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

        //the only difference between these is the type of entryView instantiated
        if (model.get('type') === 'Topic') {
          entryViewMethod = 'renderTopic';
        } else if (model.get('type') === 'Group') {
          entryViewMethod = 'renderGroup';
        } else if (model.get('type') === 'Subgroup') {
          entryViewMethod = 'renderSubgroup';
        } else if (model.get('type') === 'Place') {
          entryViewMethod = 'renderPlace';
        } else if (model.get('type') === 'Message') {
          entryViewMethod = 'renderMessage';
        } else if (model.get('type') === 'User') {
          entryViewMethod = 'renderUser';
        }

          var entryView = new Agora.Views.SidebarEntryView({ model: model });
          entryView[entryViewMethod]();
          //clicking entryView affects contetn2
          entryView.on('click', function(id, type) {
            console.log('clicked through with id: ', id, 'type: ', type);
            if (!that.app.get('expanded')) {
              $('#sidebarContainer').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                //this is madness
                setTimeout(function() { that.app.get('detailView').scrollToId(id, type); },20);
                console.log('hey');
              });
            }
            that.app.get('content2').show(that.app.get('detailView'));
            that.app.get('detailView').scrollToId(id, type);
          });

        that.$el.children('ul').append(entryView.$el);
        that.subViews.push(entryView);
      });

    };

  },




  setHandlers: function() {


    // (!!!!!!!!) NEED TO SET THE HANDLERS FOR groupTopicsButton and subgroupsButton AND BACK BUTTON


    //can't just call this.render, have to put self through content1

    var that = this;
    $('#topicsButton').on('click', function() {
      if (that.displayed !== 'Topics') {


        that.displayed = 'Topics';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#f8f8f8');
      $('.rightButton').css('background-color', '#E8E8E8');
    });

    $('#groupsButton').on('click', function() {
      if (that.displayed !== 'Groups') {


        that.displayed = 'Groups';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#E8E8E8');
      $('.rightButton').css('background-color', '#f8f8f8');
    });

    $('#groupTopicsButton').on('click', function() {
      if (that.displayed !== 'GroupTopics') {
        that.displayed = 'GroupTopics';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#f8f8f8');
      $('.rightButton').css('background-color', '#E8E8E8');
    });

    $('#subgroupsButton').on('click', function() {
      if (that.displayed !== 'Subgroups') {
        that.displayed = 'Subgroups';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#E8E8E8');
      $('.rightButton').css('background-color', '#f8f8f8');
    });

    //do i need to hit one of the reloads here??
    $('#backButton').on('click', function() {
      if (that.displayed !== 'Subgroups') {
        that.displayed = 'Subgroups';
        //need to reset the url and path
        var group = that.app.get('mapController').get('group').split('/')[0]
        that.app.get('mapController').router.navigate('World/'+that.app.get('mapController').get('location')+'~'+group, { trigger: false });
        that.app.get('mapController').set('group', group);

        that.app.get('mapController').trigger('reloadGroupSidebar', {
          location: that.app.get('mapController').get('location'),
          group: group
        });
      }
    });


    //MESSAGES/CONTACTS
    $('#messagesButton').on('click', function() {
      if (that.displayed !== 'Messages') {
        that.displayed = 'Messages';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#f8f8f8');
      $('.rightButton').css('background-color', '#E8E8E8');
    });

    $('#contactsButton').on('click', function() {
      if (that.displayed !== 'Contacts') {
        that.displayed = 'Contacts';
        that.app.get('content1').show(that);
        if (that.app.get('expanded'))
          that.app.get('content2').show(that.app.get('detailView'));
      }
      $('.leftButton').css('background-color', '#E8E8E8');
      $('.rightButton').css('background-color', '#f8f8f8');
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
