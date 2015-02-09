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
    this.displayed = 'Topics-Top';
    //indicates how we are displaying topics in topic mode
    this.topicFilter = 'Top';
    //indicates whether messages or contacts are being displayed in inbox mode
    this.inboxFilter = 'Messages';
    this.highlighted = 0;

    //indicates the page that we are on
    //used by pagination view
    this.page = 1;

    this.timeframe = 'day'
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
    
    if (this.displayed === 'Topics-Top'
      || this.displayed === 'Topics-New'
      || this.displayed === 'Topics-Hot'
      || this.displayed === 'Topics-Contacts') {



      // PAGINATION
      var paginationView = new Agora.Views.PaginationView(this.app);
      paginationView.render(this.page);
      this.$el.append(paginationView.$el);


      //It's weird that this works even when i'm selecting the div
      //and not the select, better watch this
      var $select = $('<select id="timeframeSelect">\
        <option value="day">Today</option>\
        <option value="week">This Week</option>\
        <option value="month">This Month</option>\
        <option value="year">This Year</option>\
        <option value="time">All Time</option>\
        </select>');
      $select.val(this.timeframe);


      //hmmmm, is this necessary, how are we grouping the topics sent back from the server?
      //should we have like topics-hot, topics-new... for the this.displayed values?

      $select.change(function() {
        that.timeframe = $('#timeframeSelect').val();
        console.log($('#timeframeSelect').val());

        //RELOADSIDEBARTPICS trigger
        that.app.trigger('reloadSidebarTopics');
      });

      this.$el.children('div#topButton').children('span').append($select);

      //HIDE THIS SHIT FO NOWWWWWWW
      $select.hide();

      //TRANSLATIONS YO!!!
      topPrefix = this.app.translate('Top');
      newPrefix = this.app.translate('New');
      hotPrefix = this.app.translate('Hot');
      friendsPrefix = this.app.translate('Friends');

      this.$el.append($('<div id="topButton"><span class="tabLabel">'+topPrefix+'</span></div>'));
      this.$el.append($('<div id="newButton"><span class="tabLabel">'+newPrefix+'</span></div>'));
      this.$el.append($('<div id="hotButton"><span class="tabLabel">'+hotPrefix+'</span></div>'));
      this.$el.append($('<div id="friendsButton"><span class="tabLabel">'+friendsPrefix+'</span></div>'));
      this.$el.append($('<ul class="sidebarTopicInnerList"></ul>'));
      var location = that.app.get('mapController').get('location');
      var channel = that.app.get('channel');
      var postLabel = location.split('/')[location.split('/').length-1] +'~'+ channel.split('/')[channel.split('/').length-1];

      var postToLabel = this.app.translate('Post to');

      this.$el.append($('<div id="creationButton"><span id="createLabel">'+postToLabel+': '+postLabel+'</span></div>'));
      //Set the correct button lighter
      if (this.displayed === 'Topics-Top') {
        this.$el.children('div#topButton').css('background-color','#f8f8f8');
      } else if (this.displayed === 'Topics-New') {
        this.$el.children('div#newButton').css('background-color','#f8f8f8');
      } else if (this.displayed === 'Topics-Hot') {
        this.$el.children('div#hotButton').css('background-color','#f8f8f8');
      } else if (this.displayed === 'Topics-Contacts') {
        this.$el.children('div#friendsButton').css('background-color','#f8f8f8');
      }

    } else if (this.displayed === 'Search') {
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="sidebarSpacer"></div>'));

    } else if (this.displayed === 'Contacts') {
      var contactsPrefix = this.app.translate('Friends');
      var messagesPrefix = this.app.translate('Messages');
      this.$el.append($('<div id="contactsButton"><span class="tabLabel">'+contactsPrefix+'</span></div>'));
      this.$el.append($('<div id="messagesButton"><span class="tabLabel">'+messagesPrefix+'</span></div>'));
      this.$el.children('div#contactsButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="sidebarSpacer"></div>'));
      //do I need this? might just move the message kickoff to user detail view but i'm not sure
      //this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    } else if (this.displayed === 'Messages') {
      var contactsPrefix = this.app.translate('Friends');
      var messagesPrefix = this.app.translate('Messages');
      this.$el.append($('<div id="contactsButton"><span class="tabLabel">'+contactsPrefix+'</span></div>'));
      this.$el.append($('<div id="messagesButton"><span class="tabLabel">'+messagesPrefix+'</span></div>'));
      this.$el.children('div#messagesButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="sidebarSpacer"></div>'));
      //this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    }



    var renderCollection;
    var entryViewType;

    //this code is brilliant, I need to use this more often
    if (this.displayed === 'Topics' 
      || this.displayed === 'Topics-Top'
      || this.displayed === 'Topics-New'
      || this.displayed === 'Topics-Hot'
      || this.displayed === 'Topics-Contacts') {
      renderCollection = this.collection;
    } else if (this.displayed === 'Messages') {
      renderCollection = this.messagesCollection;
    } else if (this.displayed === 'Contacts') {
      renderCollection = this.contactsCollection;
    } else if (this.displayed === 'Search') {
      renderCollection = this.searchCollection;
    }
    if (renderCollection) {

      _.each(this.subViews, function(subView) {
        subView.close();
      });
      this.subViews = [];

      //console.log('rendering sidebar with collection: ', renderCollection);

      _.each(renderCollection, function(model) {

        //the only difference between these is the type of entryView instantiated
        var entryViewMethod;
        if (model.type === 'Topic') {
          entryViewMethod = 'renderTopic';
        } else if (model.type === 'Location') {
          entryViewMethod = 'renderLocation';
        } else if (model.type === 'Channel') {
          entryViewMethod = 'renderChannel';
        } else if (model.type === 'MessageChain') {
          entryViewMethod = 'renderMessageChain';
        } else if (model.type === 'User') {
          entryViewMethod = 'renderUser';
        }

          var entryView = new Agora.Views.SidebarEntryView(that.app);
          entryView.model = model;
          entryView[entryViewMethod]();



          //#######################################
          //####### ENTRYVIEW CLICK EVENT #########
          //#######################################


          entryView.on('click', function(id, type) {

            var thet = this;

            if (model.type === 'Topic') {

              that.app.get('detailView').displayed = 'Topics';

              //get specific topic tree from server
              $.ajax({
                url: 'http://egora.co:80/topicTree',
                // url: 'http://localhost/topicTree',
                method: 'GET',
                crossDomain: true,
                data: {
                  topicId: model.id
                },
                success: function(model) {
                  that.app.get('content2').show(that.app.get('detailView'), model);
                  thet.$el.addClass('highlight');
                },
                error: function() {
                  console.log('ajax error');
                }
              });

              //register the topic visit with the server
              $.ajax({
                url: 'https://egora.co:443/visitedTopic',
                // url: 'http://localhost/topicTree',
                method: 'POST',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true
                },
                data: {
                  username: that.app.get('username'),
                  token: that.app.get('token'),
                  //WHY IS THIS A STRING????
                  topicId: model.id
                },
                success: function(data) {
                  //alert(data);
                },
                error: function() {
                  console.log('ajax error');
                }
              });


            } else if (model.type === 'MessageChain') {

              that.app.get('detailView').displayed = 'Messages';

              var contact = model.contact;

              $.ajax({
                url: 'https://egora.co:443/messageChain',
                // url: 'http://localhost/messageChain',
                method: 'GET',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true
                },
                data: {
                  username: that.app.get('username'), 
                  contact: contact,
                  token: that.app.get('token')
                },
                success: function(model) {
                  that.app.get('content2').show(that.app.get('detailView'), model, contact);
                  thet.$el.addClass('highlight');
                },
                error: function() {
                  console.log('ajax error');
                }
              });
              
            } else if (model.type === 'User') {    
              
              that.app.get('detailView').displayed = 'Contacts';
              that.app.get('content2').show(that.app.get('detailView'), model);

            } else if (model.type === 'Location') {
              // show location detail
              that.app.get('detailView').displayed = 'Locations';
              that.app.get('content2').show(that.app.get('detailView'), model);
            } else if (model.type === 'Channel') {
              // show channe ldetail
              that.app.get('detailView').displayed = 'Channels';
              that.app.get('content2').show(that.app.get('detailView'), model);
            }


            //that.app.get('detailView')[entryViewMethod](model);

            that.removeHighlights();
            this.$el.addClass('highlight');

          });//end entryview click callback


        that.$el.children('ul').append(entryView.$el);
        that.subViews.push(entryView);

        
      });//end iteration through models


      //ADD SPACER LIST ITEM?????


      //HANDLE THE EMPTY CASE
      if (!renderCollection.length) {

        if (that.app.get('detailView').displayed === 'Search') {

        } else {
        }
          var $empty = $("<li>Couldn't find anything</li>");
          that.$el.children('ul').append($empty);



      }


      











    }; 





  },




  setHandlers: function() {


    // (!!!!!!!!) NEED TO SET THE HANDLERS FOR groupTopicsButton and subgroupsButton AND BACK BUTTON


    //can't just call this.render, have to put self through content1

    //TOP/NEW/HOT
    var that = this;
    $('#topButton').on('click', function() {
      if (that.displayed !== 'Topics-Top') {

        that.displayed = 'Topics-Top';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
      }
      
      $('#topButton').css('background-color', '#f8f8f8');
      $('#newButton').css('background-color', '#E8E8E8');
      $('#hotButton').css('background-color', '#E8E8E8');
      $('#friendsButton').css('background-color', '#E8E8E8');
    });

    $('#newButton').on('click', function() {
      if (that.topicFilter !== 'New') {

        that.displayed = 'Topics-New';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
      }
      $('#topButton').css('background-color', '#E8E8E8');
      $('#newButton').css('background-color', '#f8f8f8');
      $('#hotButton').css('background-color', '#E8E8E8');
      $('#friendsButton').css('background-color', '#E8E8E8');

    });

    $('#hotButton').on('click', function() {
      if (that.topicFilter !== 'Hot') {

        that.displayed = 'Topics-Hot';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
      }
      $('#topButton').css('background-color', '#E8E8E8');
      $('#newButton').css('background-color', '#E8E8E8');
      $('#hotButton').css('background-color', '#f8f8f8');
      $('#friendsButton').css('background-color', '#E8E8E8');

    });


      $('#friendsButton').on('click', function() {
        if (that.app.get('login') === true) {
          if (that.topicFilter !== 'Friends') {

            that.displayed = 'Topics-Contacts';
            //this call results in a sidebar render
            that.app.trigger('reloadSidebarTopics');
          }
          $('#topButton').css('background-color', '#E8E8E8');
          $('#newButton').css('background-color', '#E8E8E8');
          $('#hotButton').css('background-color', '#E8E8E8');
          $('#friendsButton').css('background-color', '#f8f8f8');
        } else {
          alert(that.app.translate('you must be logged in to sort topics by friends'));
        }

      });
      





    //MESSAGES/CONTACTS
    $('#contactsButton').on('click', function() {
      console.log('JFKDLSJSLFDKJ"');
      if (that.displayed !== 'Contacts') {
        that.displayed = 'Contacts';
        that.app.get('content1').show(that);
      }
      $('#messagesButton').css('background-color', '#E8E8E8');
      $('#contactsButton').css('background-color', '#f8f8f8');
    });


    $('#messagesButton').on('click', function() {
      console.log('jdfsklafjads');
      if (that.displayed !== 'Messages') {
        that.displayed = 'Messages';
        that.app.get('content1').show(that);
      }
      $('#messagesButton').css('background-color', '#f8f8f8');
      $('#contactsButton').css('background-color', '#E8E8E8');
    });



    $('#creationButton').on('click', function() {

      if (that.app.get('login')) {
        if (that.app.get('sidebarView').displayed === 'Topics-Top'
         || that.app.get('sidebarView').displayed === 'Topics-New'
         || that.app.get('sidebarView').displayed === 'Topics-Hot'
         || that.app.get('sidebarView').displayed === 'Topics-Contacts') {

          if (that.app.get('expanded') && that.app.get('detailView').displayed === 'TopicCreation') {
            $('#topicCreationPostButton').trigger('click');
          } else {
            var topicCreation = new Agora.Views.TopicCreationView(that.app);
            that.app.get('detailView').displayed = 'TopicCreation';
            that.app.get('content2').show(topicCreation); 
          }

        }
      } else {
        alert(that.app.translate('you must be logged in to create a topic'));
      }
    });





    
    //#######################################
    //#########  RESIZING  ##################
    //#######################################

    //MAYBE JUST LOOP THROUGH SUBVIEWS AND PUT RESIZE LISTENER ON
    //PARENT SO THAT IT IS AUTOMATICALLY UNBOUND???

    var throttledResize = _.throttle(function() {


      for (var i=0; i < that.subViews.length ;i++) {
        if (that.subViews[i].model.image) {          
          var box = that.subViews[i].$el.children('.sidebarFloatClear').children('.contentAndToFromWrapper');
          var entryWidth = that.subViews[i].$el.children('.sidebarFloatClear').width();
          box.css('width', (entryWidth - 85) + 'px');
        }

      };

      //THROTTLE TIME (PERHAPS VARY THIS DEPENDING ON USER AGENT??)
    }, 100);


    $(window).on('resize', throttledResize);

    throttledResize();

    //NEED TO UNBIND THIS HANDLER SOMEHOW





    


  },


  close: function() {
    _.each(this.subViews, function(subView) {
      subView.close();
    });
    this.subViews = [];
    this.remove();
  }

});
