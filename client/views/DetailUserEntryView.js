window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailUserEntryTemplate').html() );
  },

  render: function() {
    var that = this;
    console.log(this.model);
    this.$el.html( this.template(this.model) );










    var $messageButton = $('<button>SEND MESSAGE</button>');
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
            url: 'https://liveworld.io:443/messageChain',
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
              alert('server error');
            }
          });
          break;
        }

      }//end for loop

      if (!foundChain) {

        console.log('found no chain, gotta make one');

        $.ajax({
          url: 'https://liveworld.io:433/createMessageChain',
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
            alert(data);
            console.log('created message chain');
            that.app.trigger('reloadSidebarMessageChains', function() {

              console.log('reloaded message chains');



              var chains = that.app.get('sidebarView').messagesCollection;
              console.log('DEESE chains: ', chains);
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
                  console.log('found the message chain ehh?');
                  foundChain = true;
                  //open up this shit
                  that.app.get('sidebarView').displayed = 'Messages';
                  that.app.get('detailView').displayed = 'Messages';

                  that.app.get('content1').show(that.app.get('sidebarView'));

                  (function() {
                    var x = chains[i].contact
                    $.ajax({
                      url: 'https://liveworld.io:443/messageChain',
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
                        alert('server error');
                      }
                    });

                  })();


                }

              }



            });

          },
          error: function() {
            alert('server error');
          }
        });//end create chain ajax

        
      }//end foundChain check


    };//end send message button handler




    //CONTACT REQUEST FLOW STUFF


    var $contactRequestButton = $('<button>Contact Request</button>');
    $contactRequestButton[0].onclick = function() {
      console.log('hi');
      $.ajax({
        url: 'https://liveworld.io:443/addContact',
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
            alert(data);
            //seeing whether we confirmed or sent (because if confirmed, server sends back a 
            //string that starts with 'y') (HACKY)
            console.log(data);
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
        }
      });
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

    var $toolColumn = this.$el.children('#profileColumnWrapper').children('div#profileRightColumn');


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
          $toolColumn.append('Pending Request');
        } else if (isPending) { 
          $contactRequestButton.html('Confirm Contact Request');
          $toolColumn.append($contactRequestButton);
        } else {
          if (isContact) {
            $toolColumn.append($messageButton);
          } else {
            $toolColumn.append($contactRequestButton);
          }
        }
    }



    //TODO - DISPLAY RECENTLY POSTED TOPICS (I.E. THE USER FEED) !!!!!∆∆∆∆∆!!!!!


    //get recently visited topics
    $.ajax({
      url: 'http://liveworld.io:80/recentlyPosted',
      // url: 'http://localhost/topicTree',
      method: 'GET',
      crossDomain: true,
      data: {
        username: this.model.username,
      },
      success: function(models) {
        for (var i=0; i < models.length ;i++) {
          $('#recentlyPostedList').append($('<li>'+models[i].id+'</li>'));
          console.log(models[i]);
        }
      },
      error: function() {
        alert('ajax error');
      }
    });





  },

  close: function() {
    this.remove();
    this.unbind();
  }


});