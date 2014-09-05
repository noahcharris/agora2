window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};


Agora.Views.DetailView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailView',

  initialize: function(appController) {
    this.responseBoxTemplate = _.template( $('#responseBoxTemplate').html() );
    this.app = appController;
    this.subViews = [];

    //response box variables
    this.responding = false;
  },



  render: function() {

    //NEED TO ADD USERVIEW


    var that = this;

    this.$el.empty();

    _.each(this.subViews, function(subView) {
      subView.close();
    });
    this.subViews = [];

    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    this.$el.append($('<ul class="detailInnerList"></ul>'));


    //TOPICS
    if (this.app.get('sidebarView').displayed === 'Topics'
        || this.app.get('sidebarView').displayed === 'GroupTopics'
        || this.app.get('sidebarView').displayed === 'SubgroupTopics')  {

      var renderCollection;
      if (this.app.get('sidebarView').displayed === 'Topics') {
        renderCollection = this.collection;
      } else if (this.app.get('sidebarView').displayed === 'GroupTopics') {
        renderCollection = this.groupTopicsCollection;
      } else if (this.app.get('sidebarView').displayed === 'SubgroupTopics') {
        renderCollection = this.subgroupTopicsCollection;
      }

      // ## RESPONSE BOX ##
      //console.log('appending response box in render responding: ',this.responding);
      //USE this.responseData here so users won't lose their changes
      this.$el.append(this.responseBoxTemplate());


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
        } else if (that.responseData.type === 'Comment' ||
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

      _.each(renderCollection.models, function(topic) {
        var entryView = new Agora.Views.DetailTopicEntryView(that.app);
        //setting the model here so that we can pass a reference to detailView
        entryView.model = topic;
        entryView.render();
        that.$el.children('ul').append(entryView.$el);
        that.subViews.push(entryView);
      });   


    //GROUPS

    //can these responsibilities be relegated to
    //DetailGroupEntryView and DetailSubgroupEntryView ???

    } else if (this.app.get('sidebarView').displayed === 'Groups') {
      if (this.groupsCollection) {
        _.each(this.groupsCollection.models, function(group) {
          var entryView = new Agora.Views.DetailGroupEntryView(this.app);
          entryView.model = group;
          entryView.render();
          that.$el.children('ul').append(entryView.$el);
          entryView.$el.children('div').children('button').on('click', function(e) {

            // ## LISENERS FOR THE 'VISIT' BUTTON ##
            //OK THIS IS SOME CRAZY SHIT
            //might as well just always trigger through mapController.....
            that.app.get('sidebarView').displayed = 'GroupTopics';
            that.app.get('mapController').router.navigate('World/'+group.get('location')+'~'+group.get('name'), { trigger: false });
            that.app.get('mapController').set('group', group.get('name'));
            that.app.get('mapController').trigger('reloadGroupSidebar', {
              location: group.get('location'),
              group: group.get('name')
            });

          });
          that.subViews.push(entryView);
        });    
      }
    } else if (this.app.get('sidebarView').displayed === 'Subgroups') {

      if (this.subgroupsCollection) {
        _.each(this.subgroupsCollection.models, function(subgroup) {
          var entryView = new Agora.Views.DetailSubgroupEntryView(this.app);
          entryView.model = subgroup;
          entryView.render();
          //need to set handlers on the entryView for going to the proper group
          that.$el.children('ul').append(entryView.$el);
          entryView.$el.children('button').on('click', function(e) {

            // ## LISENERS FOR THE 'VISIT' BUTTON ##
            //OK THIS IS SOME CRAZY SHIT
            //might as well just always trigger through mapController.....
            that.app.get('sidebarView').displayed = 'SubgroupTopics';
            //this is how we will represent subgroups for now, need to change goToPath()..
            that.app.get('mapController').trigger('reloadSubgroupSidebar', {
              location: subgroup.get('location'),
              group: subgroup.get('agroup'),
              name: subgroup.get('name')
            });

          });
          that.subViews.push(entryView);
        });
      }



      // SEARCH

      //need to add user here
    } else if (this.app.get('sidebarView').displayed === 'All') {

      if (this.searchCollection) {
        _.each(this.searchCollection.models, function(model) {

          if (model.get('type') === 'Topic') {
            entryViewType = Agora.Views.DetailTopicEntryView;
          } else if (model.type === 'Group') {
            entryViewType = Agora.Views.DetailGroupEntryView;
          } else if (model.type === 'Subgroup') {
            entryViewType = Agora.Views.DetailSubgroupEntryView;
          } else if (model.type === 'Place') {
            entryViewType = Agora.Views.DetailPlaceEntryView;
          } else if (model.type === 'User') {
            entryViewType = Agora.Views.DetailUserEntryView;
          }

          var entryView = new entryViewType(this.app);
          entryView.model = model;
          entryView.render();
          that.$el.children('ul').append(entryView.$el);
          that.subViews.push(entryView);
        });
      }


    //MESSAGES

    } else if (this.app.get('sidebarView').displayed === 'Messages') {
      if (this.messagesCollection) {
        _.each(this.messagesCollection.models, function(model) {
          var entryView = new Agora.Views.DetailMessageEntryView();
          entryView.model = model;
          entryView.render();
          that.$el.children('ul').append(entryView.$el);
          that.subViews.push(entryView);
        });
      }
    } else if (this.app.get('sidebarView').displayed === 'Contacts') {
      if (this.usersCollection) {
        _.each(this.usersCollection.models, function(model) {
          var entryView = new Agora.Views.DetailUserEntryView();
          entryView.model = model;
          entryView.render();
          that.$el.children('ul').append(entryView.$el);
          that.subViews.push(entryView);
        });
      }
    }





    // CALCULATING HEIGHT AND SENDING IT TO SIDEBARVIEW
    this.interval = setInterval(function() {
      var currentHeight = that.$el.children('ul').scrollTop();
      //need to iterate through all the children, 
      //get their height, compare it to scrollTop, and send it through
      //with the trigger
      var totalHeight = 0;
      var count = 0;
      finalCount = 0;
      var reached = false;
      that.$el.children('ul').children('li').each(function() {
        totalHeight += $(this).height();
        //little tweak here for now..
        //WHAT AM I SUPPOSED TO DO HERE
        totalHeight -= 10;
        //this reached business but I don't know how else to deal with this jquery iteration..
        if (totalHeight >= currentHeight && !reached) {
          //console.log('currentHeight: ', currentHeight, ' totalHeight: ', totalHeight, ' count: ', count);
          reached = true;
          //fix this..
          finalCount = count;
        }
        count++;
      });
      that.trigger('scrolling', finalCount);
    }, 100);
  },

  //###################################
















  close: function() {
    this.app.get('sidebarView').removeHighlights();
    _.each(this.subViews, function(subView) {
      subView.close();
    });
    this.subViews = [];
    //close the response box
    //this.closeResponseBox();
    this.remove();
    clearInterval(this.interval);
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

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  scrollToId: function(id, type) {

    var renderCollection;
    if (this.app.get('sidebarView').displayed === 'Topics') {
      renderCollection = this.collection;
    } else if (this.app.get('sidebarView').displayed === 'Groups') {
      renderCollection = this.groupsCollection;
    } else if (this.app.get('sidebarView').displayed === 'GroupTopics') {
      renderCollection = this.groupTopicsCollection;
    } else if (this.app.get('sidebarView').displayed === 'Subgroups') {
      renderCollection = this.subgroupsCollection;
    } else if (this.app.get('sidebarView').displayed === 'SubgroupTopics') {
      renderCollection = this.subgroupTopicsCollection;
    } else if (this.app.get('sidebarView').displayed === 'All') {
      renderCollection = this.searchCollection;
    }

    var models = renderCollection.models;
    var count = 0;
    for (var i=0;i<models.length;i++) {
      if (models[i].type === type && models[i].id === id) {
        break;
      }
      count++;
    }
    

    var totalHeight = 0;
    var count2 = 0;
    this.$el.children('ul').children('li').each(function() {
      if (count > count2)
        totalHeight += $(this).height();
      count2++;
    });
    this.$el.children('ul').scrollTop(totalHeight);

  },

});
