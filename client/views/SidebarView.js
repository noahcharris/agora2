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
    
    if (this.displayed === 'Topics' 
      || this.displayed === 'Topics-Top'
      || this.displayed === 'Topics-New'
      || this.displayed === 'Topics-Hot') {


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
      this.$el.append($('<div class="leftThirdButton" id="topButton"><span class="tabLabel">Top'
        +'</span></div>'));

      $select.change(function() {
        that.timeframe = $('#timeframeSelect').val();
        console.log($('#timeframeSelect').val());

        //RELOADSIDEBARTPICS trigger
        that.app.trigger('reloadSidebarTopics');
      });

      this.$el.children('div.leftThirdButton').children('span').append($select);

      this.$el.append($('<div class="middleThirdButton" id="newButton"><span class="tabLabel">New</span></div>'));
      this.$el.append($('<div class="rightThirdButton" id="hotButton"><span class="tabLabel">Hot</span></div>'));
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      this.$el.append($('<div id="creationButton"><span class="createLabel">Create Topic</span></div>'));
      //Set the correct button lighter
      if (this.displayed === 'Topics-Top') {
        this.$el.children('div.leftThirdButton').css('background-color','#f8f8f8');
      } else if (this.displayed === 'Topics-New') {
        this.$el.children('div.middleThirdButton').css('background-color','#f8f8f8');
      } else if (this.displayed === 'Topics-Hot') {
        this.$el.children('div.rightThirdButton').css('background-color','#f8f8f8');
      }

    } else if (this.displayed === 'All') {
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      //display 'results:'?

    } else if (this.displayed === 'Messages') {
      this.$el.append($('<div class="leftHalfButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightHalfButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.children('div.leftHalfButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      //do I need this? might just move the message kickoff to user detail view but i'm not sure
      //this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    } else if (this.displayed === 'Contacts') {
      this.$el.append($('<div class="leftHalfButton" id="messagesButton"><span class="tabLabel">Messages</span></div>'));
      this.$el.append($('<div class="rightHalfButton" id="contactsButton"><span class="tabLabel">Contacts</span></div>'));
      this.$el.children('div.rightHalfButton').css('background-color','#f8f8f8');
      this.$el.append($('<ul class="sidebarInnerList"></ul>'));
      //this.$el.append($('<div id="creationButton"><span class="createLabel">Create Message</span></div>'));
    }


    // INCLUDE PAGINATION HERE


    var renderCollection;
    var entryViewType;

    //this code is brilliant, I need to use this more often
    if (this.displayed === 'Topics' 
      || this.displayed === 'Topics-Top'
      || this.displayed === 'Topics-New'
      || this.displayed === 'Topics-Hot') {
      renderCollection = this.collection;
    } else if (this.displayed === 'All') {
      renderCollection = this.searchCollection;
    } else if (this.displayed === 'Messages') {
      renderCollection = this.messagesCollection;
    } else if (this.displayed === 'Contacts') {
      renderCollection = this.contactsCollection;
    }
    if (renderCollection) {

      _.each(this.subViews, function(subView) {
        subView.close();
      });
      this.subViews = [];

      console.log('rendering sidebar with collection: ', renderCollection);

      _.each(renderCollection, function(model) {

        //the only difference between these is the type of entryView instantiated
        var entryViewMethod;
        if (model.type === 'Topic') {
          entryViewMethod = 'renderTopic';
        } else if (model.type === 'Place') {
          entryViewMethod = 'renderPlace';
        } else if (model.type === 'MessageChain') {
          entryViewMethod = 'renderMessageChain';
        } else if (model.type === 'User') {
          entryViewMethod = 'renderUser';
        }

        console.log(entryViewMethod);

          var entryView = new Agora.Views.SidebarEntryView(that.app);
          entryView.model = model;
          entryView[entryViewMethod]();






          //#######################################
          //####### ENTRYVIEW CLICK EVENT #########
          //#######################################

          //need to use the above pattern with this detailView rendering shit
          // entryView.on('mouseover', function() {
          //   that.app.get('mapController').highlightCountry('United States');
          //   that.app.get('mapController').highlightCountry('China');
          //   that.app.get('mapController').highlightCountry('France');
          //   that.app.get('mapController').highlightCountry('Germany');
          //   that.app.get('mapController').highlightCountry('Argentina');
          //   that.app.get('mapController').highlightCountry('Australia');
          //   that.app.get('mapController').highlightCountry('Monaco');
          //   that.app.get('mapController').highlightCountry('Italy');
          //   that.app.get('mapController').highlightCountry('Ecuador');
          //   that.app.get('mapController').highlightCountry('Palestine');
          // });

          // entryView.on('mouseout', function() {
          //   that.app.get('mapController').removeHighlightCountry('United States');
          //   that.app.get('mapController').removeHighlightCountry('China');
          //   that.app.get('mapController').removeHighlightCountry('France');
          //   that.app.get('mapController').removeHighlightCountry('Germany');
          //   that.app.get('mapController').removeHighlightCountry('Argentina');
          //   that.app.get('mapController').removeHighlightCountry('Australia');
          //   that.app.get('mapController').removeHighlightCountry('Monaco');
          //   that.app.get('mapController').removeHighlightCountry('Italy');
          //   that.app.get('mapController').removeHighlightCountry('Ecuador');
          //   that.app.get('mapController').removeHighlightCountry('Palestine');
          // });



          entryView.on('click', function(id, type) {

            var urlSuffix;

            var thet = this;

            if (model.type === 'Topic') {

              that.app.get('detailView').displayed = 'Topics';

              $.ajax({
                url: 'http://localhost/topicTree',
                method: 'GET',
                crossDomain: true,
                data: {
                  //these two models are different scope!
                  topicId: model.id
                },
                success: function(model) {
                  console.log('soooooooweeeeeeeta: ', model);
                  that.app.get('content2').show(that.app.get('detailView'), model);
                  thet.$el.addClass('highlight');
                },
                error: function() {
                  alert('server error');
                }
              });

            } else if (model.type === 'MessageChain') {
              that.app.get('detailView').displayed = 'Messages';
              urlSuffix = 'messageChain';

              $.ajax({
                url: 'http://localhost/messageChain',
                method: 'GET',
                crossDomain: true,
                data: {
                  //these two models are different scope!
                  topicId: model.id
                },
                success: function(model) {
                  console.log('soooooooweeeeeeeta: ', model);
                  that.app.get('content2').show(that.app.get('detailView'), model);
                  thet.$el.addClass('highlight');
                },
                error: function() {
                  alert('server error');
                }
              });
            } else if (model.type === 'User') {              
              that.app.get('detailView').displayed = 'Contacts';
              that.app.get('content2').show(that.app.get('detailView'), model);
            }


            //that.app.get('detailView')[entryViewMethod](model);



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
      if (that.displayed !== 'Topics-Top') {

        that.displayed = 'Topics-Top';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
      }
      $('.leftThirdButton').css('background-color', '#f8f8f8');
      $('.middleThirdButton').css('background-color', '#E8E8E8');
      $('.rightThirdButton').css('background-color', '#E8E8E8');
    });

    $('#newButton').on('click', function() {
      if (that.topicFilter !== 'New') {

        that.displayed = 'Topics-New';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
      }
      $('.leftThirdButton').css('background-color', '#E8E8E8');
      $('.middleThirdButton').css('background-color', '#f8f8f8');
      $('.rightThirdButton').css('background-color', '#E8E8E8');
    });

    $('#hotButton').on('click', function() {
      if (that.topicFilter !== 'Hot') {

        that.displayed = 'Topics-Hot';
        //this call results in a sidebar render
        that.app.trigger('reloadSidebarTopics');
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




    $('#creationButton').on('click', function() {
      if (that.app.get('login')) {
        if (that.app.get('sidebarView').displayed === 'Topics-Top'
         || that.app.get('sidebarView').displayed === 'Topics-New'
         || that.app.get('sidebarView').displayed === 'Topics-Hot') {

          var topicCreation = new Agora.Views.TopicCreationView(that.app);
          that.app.get('detailView').displayed = 'TopicCreation';
          that.app.get('content2').show(topicCreation); 
        }
      } else {
        alert('you must be logged in to create a topic');
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
