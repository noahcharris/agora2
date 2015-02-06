window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  tagName: 'div',

  id: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailUserEntryTemplate').html() );
    this.RTLtemplate = _.template( $('#RTLdetailUserEntryTemplate').html() );

    this.subViews = [];
  },

  render: function() {
    var that = this;
    this.model.aboutLabel = this.app.translate('About');
    this.model.locationLabel = this.app.translate('Current Location');
    this.model.originLabel = this.app.translate('Origin');
    this.model.recentlyPostedLabel = this.app.translate('Recently Posted');


    if (this.app.get('language') !== 'ar') {
      this.$el.html( this.template(this.model) );
    } else {
      this.$el.html( this.RTLtemplate(this.model) );
    }




    var $messageButton = $('<button>'+that.app.translate('Send Message')+'</button>');
    $messageButton[0].onclick = function(params) {
      //OPEN UP THE CONVO WITH CONTACT IF IT EXISTS (CONVERSATION VIEW)
      //OTHERWISE MAKE ONE
      var chains = that.app.get('sidebarView').messagesCollection;
      var offsetCount = -1;
      var foundChain = false;
      for (var i=0; i < chains.length ;i++) {

        offsetCount++;

        if (chains[i].username1 === that.app.get('username')) {
          chains[i].contact = chains[i].username2;
        } else {
          chains[i].contact = chains[i].username1;
        }

        //will need to account for pagination here eventually

        if (chains[i].contact === that.model.username) {
          foundChain = true;
          //open up this shit
          that.app.get('sidebarView').displayed = 'Messages';
          that.app.get('detailView').displayed = 'Messages';

          that.app.get('content1').show(that.app.get('sidebarView'));

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
              contact: chains[i].contact,
              token: that.app.get('token')
            },
            success: function(model) {
              //horrible

              that.app.get('content2').show(that.app.get('detailView'), model, chains[i].contact);
              that.app.get('sidebarView').highlightCell(offsetCount);
            },
            error: function() {
              alert(that.app.translate('server error'));
            }
          });
          break;
        }

      }//end for loop

      if (!foundChain) {

        console.log('found no chain, gotta make one');

        $.ajax({
          url: 'https://egora.co:443/createMessageChain',
          // url: 'http://localhost/createMessageChain',
          method: 'POST',
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          data: {
            username: that.app.get('username'),
            contact: that.model.username,
            token: that.app.get('token')
          },
          success: function(data) {
            console.log('created message chain');
            that.app.trigger('reloadSidebarMessageChains', function() {

              var chains = that.app.get('sidebarView').messagesCollection;
              var offsetCount = -1;
              for (var i=0; i < chains.length ;i++) {
                offsetCount++;

                if (chains[i].username1 === that.app.get('username')) {
                  chains[i].contact = chains[i].username2;
                } else {
                  chains[i].contact = chains[i].username1;
                }

                //will need to account for pagination here eventually

                if (chains[i].contact === that.model.username) {
                  foundChain = true;
                  //open up this shit
                  that.app.get('sidebarView').displayed = 'Messages';
                  that.app.get('detailView').displayed = 'Messages';

                  that.app.get('content1').show(that.app.get('sidebarView'));

                  (function() {
                    var x = chains[i].contact
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
                        contact: chains[i].contact,
                        token: that.app.get('token')
                      },
                      success: function(model) {
                        //ugh so bad
                        that.app.get('content2').show(that.app.get('detailView'), model, x);
                        that.app.get('sidebarView').highlightCell(offsetCount);
                      },
                      error: function() {
                        alert(that.app.translate('server error'));
                      }
                    });

                  })();


                }

              }



            });

          },
          error: function() {
            alert(that.app.translate('server error'));
          }
        });//end create chain ajax

        
      }//end foundChain check


    };//end send message button handler















    //CONTACT REQUEST FLOW STUFF


    var $contactRequestButton = $('<button>'+that.app.translate('Contact Request')+'</button>');
    var ajaxing = false;
    $contactRequestButton[0].onclick = function() {

      if (!ajaxing) {

          ajaxing = true;
          $.ajax({
            url: 'https://egora.co:443/addContact',
            // url: 'http://localhost:80/sendContactRequest',
            method: 'POST',
            crossDomain: true,
            xhrFields: {
              withCredentials: true
            },
            data: {
              username: that.app.get('username'),
              contact: that.model.username,
              token: that.app.get('token')
            },
            success: function(data) {
              if (data) {
                alert(that.app.translate(data));
                ajaxing = false;
                //seeing whether we confirmed or sent (because if confirmed, server sends back a 
                //string that starts with 'y') (HACKY)
                if (data[0] === 's') {
                  that.app.get('cacheManager').sentRequests.push({ recipient: that.model.username });
                } else {
                  //erase entry from cache manager's contact request list
                  var contacts = that.app.get('cacheManager').contactRequests
                  for (var i=0; i < contacts.length ;i++) {
                    if (contacts[i].sender === that.model.username)
                      contacts[i] = {};
                  }

                  that.app.get('cacheManager').contacts.push({ username: that.model.username });


                }
                that.render(that.model);
              } else {
              }
            }, error: function(err) {
              console.log('ajax error ocurred: ', err);
              ajaxing = false;
            }
          });
        
      }
    };


    //MAYBE ONLY DO THIS FOR A LITTLE WHILE AFTER THE PROFILE HAS BEEN UPDATED??????
    var suffix = '';
    if (this.model.username === this.app.get('username')) {
      suffix = '?extra=' + Math.floor((Math.random() * 10000) + 1);
    }
    this.$el.children('#profileColumnWrapper').children('#profilePicture').attr('src', this.model.image + suffix);

    //IMAGE OVERLAY
    (function() {
      var on = false;
      that.$el.children('#profileColumnWrapper').children('#profilePicture')[0].onclick = function(e) {
        e.stopPropagation();
        if (!on) {
          on = true;
          var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image + suffix +'"></img></div>')
          $overlayImage.on('click', function() {
            $(this).fadeOut(333, function() {
              $(this).remove();
              on = false;
            });
          });
          $('#mainWrapper').append($overlayImage);
          $overlayImage.hide();
          $overlayImage.fadeIn(333);
        }
      };
    })();

    var $toolColumn = this.$el.children('#toolColumn');


    var contacts = this.app.get('cacheManager').contacts;
    var isContact = false;
    for (var i=0; i < contacts.length ;i++) {
      if (this.model.username === contacts[i].username) {
        isContact = true;
        break;
      }
    }

    var sent = this.app.get('cacheManager').sentRequests;
    var isSent = false;
    for (var i=0; i < sent.length ;i++) {
      if (this.model.username === sent[i].recipient) {
        isSent = true;
        break;
      }
    }

    var requests = this.app.get('cacheManager').contactRequests;
    var isPending = false;
    for (var i=0; i < requests.length ;i++) {
      if (this.model.username === requests[i].sender) {
        isPending = true;
        break;
      }
    }

    if (that.app.get('login') && this.model.username !== that.app.get('username')) {
        if (isSent) {
          $toolColumn.append(that.app.translate('Pending Request'));
        } else if (isPending) { 
          $contactRequestButton.html(that.app.translate('Confirm Contact Request'));
          $toolColumn.append($contactRequestButton);
        } else {
          if (isContact) {
            $toolColumn.append($messageButton);
          } else {
            $toolColumn.append($contactRequestButton);
          }
        }
    }


















    //     ____                       __  __         ____             __           __
    //    / __ \___  ________  ____  / /_/ /_  __   / __ \____  _____/ /____  ____/ /
    //   / /_/ / _ \/ ___/ _ \/ __ \/ __/ / / / /  / /_/ / __ \/ ___/ __/ _ \/ __  / 
    //  / _, _/  __/ /__/  __/ / / / /_/ / /_/ /  / ____/ /_/ (__  ) /_/  __/ /_/ /  
    // /_/ |_|\___/\___/\___/_/ /_/\__/_/\__, /  /_/    \____/____/\__/\___/\__,_/   
    //                                  /____/                                       

    //only appears if the users are contacts

    if (this.app.get('login')) {

        $.ajax({
          url: 'https://egora.co:443/recentlyPosted',
          // url: 'http://localhost/topicTree',
          method: 'GET',
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          data: {
            username: this.model.username,
            visitor: this.app.get('username'),
            token: this.app.get('token')
          },
          success: function(data) {

            if (data.success) {
              var models = data.data;


                for (var i=0; i < models.length ;i++) {
                  var entryView = new Agora.Views.SidebarEntryView(that.app);
                  entryView.noMouseover = true;
                  that.subViews.push(entryView);
                  entryView.model = models[i];
                  entryView.renderTopic();
                  var $listItem = $('<li class="recentlyPostedItem"></li>');
                  $listItem.append(entryView.$el);
                  $('#recentlyPostedList').append($listItem);
                  
                  (function() {
                    var topicId = models[i].id;
                    var model = models[i];
                    var x = models[i].channel;
                    var y = models[i].location;

                      entryView.on('click', function() {

                        // debugger;

                        that.app.get('detailView').displayed = 'Topics';

                        //get specific topic tree from server


                        that.app.set('channel', x);
                        that.app.get('mapController').goToPath(y);
                        that.app.get('channelView').render();

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
                            //debugger;
                            that.app.get('sidebarView').displayed = 'Topics-Top';
                            that.app.get('content2').show(that.app.get('detailView'), model);

                            // thet.$el.addClass('highlight');
                            //need to insert topic into the front of the topics collection
                            //use this crazy callback shit to highlight

                            var cb = function() {
                              var subViews = that.app.get('sidebarView').subViews;
                              for (var i=0; i < subViews.length ;i++) {
                                if (subViews[i].model.id === model.id) {
                                  subViews[i].$el.addClass('highlight');
                                  //maybe scroll also here

                                }
                              }
                            };
                            that.app.trigger('reloadSidebarTopics', that.app.get('mapController').get('location'), model, cb);


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

                      });//end entryView onclick

                  })();

                };//end models for loop



                var throttledResize = _.throttle(function() {

                        //this is how region manager calculates sidebar width

                  

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
                
            } else {
              that.$el.append('you must be friends to view user post history');
            }

          },
          error: function() {
            console.log('ajax error');
          }
        });//end recetlyPosted ajax

      
    } else {
      this.$el.append('you must be friends to view user post history');
    }


    //clickthroughs on origin and current location
    var $origin = this.$el.children('#profileOrigin');
    var $currentLocation = this.$el.children('#profileLocation');

    $origin.on('click', function() {
      that.app.get('mapController').goToPath(that.model.origin);
    });

    $currentLocation.on('click', function() {
      that.app.get('mapController').goToPath(that.model.location);
    });














  },

  close: function() {
    this.remove();
    this.unbind();
  }


});