window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailTopicEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {

    //for sending to response box
    this.app = appController;

    this.topicTemplate = _.template( $('#detailTopicEntryTemplate').html() );
    this.commentTemplate = _.template( $('#detailCommentEntryTemplate').html() );
    this.responseTemplate = _.template( $('#detailResponseEntryTemplate').html() );
    this.replyTemplate = _.template( $('#detailReplyEntryTemplate').html() );
    this.inputBoxTemplate = _.template( $('#inputBoxTemplate').html() );

    this.responding = null;
    this.responseData = null;

    //for content box resizes
    this.topicContentBox = null;
    this.commentContentBoxes = [];
    this.responseContentBoxes = [];
    this.replyContentBoxes = [];

    this.enterHandler = null;
  },

  render: function() {

    var that = this;


    //##############################
    //####### RESPONSE BOX #########
    //##############################

    //MESSAGE BOX DOESN'T POST WITHIN GROUPS YET
    this.$el.append(this.inputBoxTemplate());
    this.$el.children('div#inputBox').css('height', '0px');

    this.$el.append($('<div id="conversationWrapper"></div>'));

    //image input
    var $imageInput = $('<input type="file" id="imageInput"></input>');
    this.$el.children('div#inputBox').append($imageInput);


    this.$el.children('#inputBox').append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('#inputBox').children('img.x')[0].onclick = function() {
      that.closeInputBox();
    };


    if (this.responding) {
      //why do I need to use this selector?
      this.$el.children('#conversationWrapper').children('div#inputBox').css('height', '100px');
    }


    //append topic box
    this.$el.children('#conversationWrapper').append( this.topicTemplate(this.model) );

    this.topicContentBox = this.$el.children('#conversationWrapper').children('.topicBox').children('#detailTopicClear').children('#topicContentBox');

    if (!this.model.image) {
        this.$el.children('#conversationWrapper').children('.topicBox').children('#detailTopicClear').children('#detailTopicImage').css('width', '0px');
    } else {
        this.topicContentBox.hasImage = true; 
        this.$el.children('#conversationWrapper').children('.topicBox').children('#detailTopicClear').children('#detailTopicImage').attr('src', this.model.image);
        //IMAGE OVERLAY
        (function() {
          var on = false;
          that.$el.children('#conversationWrapper').children('.topicBox').children('#detailTopicClear').children('#detailTopicImage')[0].onclick = function(e) {
            e.stopPropagation();
            if (!on) {
              on = true;
              var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image +'"></img></div>')
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
    }

    var $userString = this.$el.children('#conversationWrapper').children('.topicBox').children('.topicTopString').children('#detailUserString');
    $userString[0].onclick = function() {
      that.goToUser(that.model.username);
    };

    var $channelString = this.$el.children('#conversationWrapper').children('.topicBox').children('.topicTopString').children('#detailChannelString');;
    $channelString[0].onclick = function() {

      that.app.changeChannel(that.model.channel);

    };

    //add upvote handling
    var $upvote = this.$el.children('#conversationWrapper').children('div.topicBox').children('img');
    $upvote[0].onclick = function() {

      $.ajax({
        url: 'https://liveworld.io:443/upvoteTopic',
        // url: 'http://localhost/upvoteTopic',
        method: 'POST',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: {
          username: that.app.get('username'),
          token: that.app.get('token'),
          topicId: that.model.id
        },
        success: function(msg) {
          alert(msg);
          //some weird shit going on here with detailView
          // that.app.get('sidebarView').displayed = 'Topics-New'
          // that.app.get('content2').hide();
          // that.app.trigger('reloadSidebarTopics');
        },
        error: function() {
          alert('upvote failed');
        }
      });

    };







    var comments = this.model.comments;


    //$starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
    //$shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
    //this.$el.children('div.topicBox').children('div.topicContentBox').append($starIcon);
    //this.$el.children('div.topicBox').children('div.topicContentBox').append($shareIcon);


    var $topicReplyButton = this.$el.children('#conversationWrapper').children('div.topicBox').children('#detailTopicClear').children('.replyButton');
    //sending data to the response box
    $topicReplyButton[0].onclick = function() {
      
      var responseParams = {
        location: that.model.location,
        channel: that.model.channel,
        topicId: that.model.id,
        urlSuffix: 'createComment'
      }

      that.openInputBox(responseParams);

    };




    for (var i=0;i<comments.length;i++) {
      
      //CREATE AND APPEND COMMENT TO OUTERBOX
      var $comment = $(this.commentTemplate(comments[i]));

      (function() {
        var x = comments[i].username;
        var $commentUserString = $comment.children('.commentTopString').children('.detailCommentUserString');
        $commentUserString[0].onclick = function() {
          that.goToUser(x);
        };
      })();



      this.$el.children('#conversationWrapper').append( $comment );

      var commentContentBox = $comment.children('.detailCommentClear').children('.commentContentBox');

      if (!comments[i].image) {
        $comment.children('.detailCommentClear').children('.detailCommentImage').css('width', '0px');
      } else {
            commentContentBox.hasImage = true;
            $comment.children('.detailCommentClear').children('.detailCommentImage').attr('src', comments[i].image);
            //IMAGE OVERLAY
            (function() {
              var image = comments[i].image;
              var on = false;
              $comment.children('.detailCommentClear').children('.detailCommentImage')[0].onclick = function(e) {
                e.stopPropagation();
                if (!on) {
                  on = true;
                  var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ image +'"></img></div>')
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
      }
      this.commentContentBoxes.push(commentContentBox);

      var $upvote = $comment.children('img');
      (function() {
        var x = comments[i].id;
        $upvote[0].onclick = function() {

          $.ajax({
            url: 'https://liveworld.io:443/upvoteComment',
            // url: 'http://localhost/upvoteComment',
            method: 'POST',
            crossDomain: true,
            xhrFields: {
              withCredentials: true
            },
            data: {
              username: that.app.get('username'),
              token: that.app.get('token'),
              commentId: x
            },
            success: function(msg) {
              alert(msg);
            },
            error: function() {
              alert('upvote failed');
            }
          });

        };
        
      })();
      

      var $commentReplyButton = $comment.children('.detailCommentClear').children('div.replyButton');
      var $expandCommentButton = $comment.children('.detailCommentClear').children('img.expandCommentButton');
      if (comments[i].responses.length === 0) {
        $expandCommentButton.hide();
      }

      //sending data to the response box
      var a = function() {
        var x = i;
        $commentReplyButton[0].onclick = function() {

          var responseParams = {
            location: that.model.location,
            channel: that.model.channel,
            topicId: that.model.id,
            commentId: comments[x].id,
            urlSuffix: 'createResponse'
          }

          that.openInputBox(responseParams);
        };
      };
      a();

      //$starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
      //$shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
      //$comment.children('div.commentContentBox').append($starIcon);
      //$comment.children('div.commentContentBox').append($shareIcon);


      var $commentExpansionBox = $('<div class="commentExpansionBox">');


      //this fixed the problem like in detailView, but why??
      var c = function() {


        var commentCollapsed = true;
        $expandCommentButton[0].onclick = function(e) {
          if (!commentCollapsed) {

            //TODO
            $(e.target).parent().parent().next().css('height', '0px');
            $(e.target).attr('src', 'resources/images/expand.png');
            commentCollapsed = true;
          } else if (commentCollapsed) {

            //TODO

            //well, there it is. will have to also change parent values in the response expansion
            var height = 0;
            $(e.target).parent().parent().next().children().each(function(index) {
              console.log($(this).height());
              height += $(this).height();
              console.log('hwhw', height);
            });

            $(e.target).parent().parent().next().css('height', height + 'px');

            $(e.target).attr('src', 'resources/images/contract.png');
            commentCollapsed = false;
          }
        };

      }
      c();

      this.$el.children('#conversationWrapper').append($commentExpansionBox);


      for (var j=0;j < comments[i].responses.length;j++) {

        var $response = $(this.responseTemplate(comments[i].responses[j]));

        (function() {
          var x = comments[i].responses[j].username;
          var $responseUserString = $response.children('.responseTopString').children('.detailResponseUserString');
          $responseUserString[0].onclick = function() {
            that.goToUser(x);
          };
        })();

        var $upvote = $response.children('img');
        (function() {
          var x = comments[i].responses[j].id;
          $upvote[0].onclick = function() {
            $.ajax({
              url: 'https://liveworld.io:443/upvoteResponse',
              // url: 'http://localhost/upvoteResponse',
              method: 'POST',
              crossDomain: true,
              xhrFields: {
                withCredentials: true
              },
              data: {
                username: that.app.get('username'),
                token: that.app.get('token'),
                responseId: x
              },
              success: function(msg) {
                alert(msg);
              },
              error: function() {
                alert('upvote failed');
              }
            });
          };
        })();


        var responseContentBox = $response.children('.detailResponseClear').children('.responseContentBox');
        
        if (!comments[i].responses[j].image) {
          $response.children('.detailResponseClear').children('.detailResponseImage').css('width', '0px');
        } else {
            responseContentBox.hasImage = true;
            $response.children('.detailResponseClear').children('.detailResponseImage').attr('src', comments[i].responses[j].image);
            (function() {
              var image = comments[i].responses[j].image;
              var on = false;
              $response.children('.detailResponseClear').children('.detailResponseImage')[0].onclick = function(e) {
                e.stopPropagation();
                if (!on) {
                  on = true;
                  var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ image +'"></img></div>')
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
        }

        this.responseContentBoxes.push(responseContentBox);

        var $responseReplyButton = $response.children('.detailResponseClear').children('div.replyButton');
        var $expandResponseButton = $response.children('.detailResponseClear').children('img.expandResponseButton');

        if (comments[i].responses[j].replies.length === 0) {
          $expandResponseButton.hide();
        }

        //sending data to the response box
        var b = function() {
          var x = i;
          var y = j;
          $responseReplyButton[0].onclick = function() {
            var responseParams = {
              location: that.model.location,
              channel: that.model.channel,
              topicId: that.model.id,
              commentId: comments[x].id,
              responseId: comments[x].responses[y].id,
              urlSuffix: 'createReply',
              replyToUser: comments[x].responses[y].username
            }

            that.openInputBox(responseParams);
          };
        };
        b();



        //$comment.children('div.replyContentBox').append($replyReplyButton);

        //$starIcon = $('<img height="20px" width="20px" src="resources/images/star.png"></img>');
        //$shareIcon = $('<img height="20px" width="20px" src="resources/images/share.png"></img>');
        //$comment.children('div.replyContentBox').append($starIcon);
        //$comment.children('div.replyContentBox').append($shareIcon);

        var $responseExpansionBox = $('<div class="responseExpansionBox">');


        var d = function() {

          var responseCollapsed = true;
          //this fixed the problem like in detailView, but why??
          $expandResponseButton[0].onclick = function(e) {
            console.log('whaha');
            if (!responseCollapsed) {

              var x = $(e.target).parent().parent().next().height();

              //TODO
              $(e.target).parent().parent().next().css('height', '0px');

              var y = $(e.target).parent().parent().parent().height();
              $(e.target).parent().parent().parent().css('height', y - x + 'px');



              $(e.target).attr('src', 'resources/images/expand.png');
              responseCollapsed = true;
            } else if (responseCollapsed) {
              //TODO
              // $(e.target).parent().next().css('height', 'auto');
              // $(e.target).attr('src', 'resources/images/contract.png');
              // responseCollapsed = false;
              var height = 0;
              $(e.target).parent().parent().next().children().each(function(index) {
                console.log($(this).height());
                height += $(this).height();
              });


              $(e.target).parent().parent().next().css('height', height + 'px');

              //NEED TO CHANGE PARENT AS WELL, BECAUSE THEY ARE NESTED
              var x = $(e.target).parent().parent().parent().height();
              $(e.target).parent().parent().parent().css('height', x + height + 'px');


              $(e.target).attr('src', 'resources/images/contract.png');
              responseCollapsed = false;

            }
          };

        }
        d();


        $commentExpansionBox.append($response);

        $commentExpansionBox.append($responseExpansionBox);




        for (var k=0;k<comments[i].responses[j].replies.length;k++) {

          var $reply = $(this.replyTemplate(comments[i].responses[j].replies[k]));

          (function() {
            var x = comments[i].responses[j].replies[k].username;
            var $replyUserString = $reply.children('.replyTopString').children('.detailReplyUserString');
            $replyUserString[0].onclick = function() {
              that.goToUser(x);
            };
          })();



          var $upvote = $reply.children('img');
          (function() {
            var x = comments[i].responses[j].replies[k].id;
            $upvote[0].onclick = function() {
              $.ajax({
                url: 'https://liveworld.io:443/upvoteReply',
                // url: 'http://localhost/upvoteReply',
                method: 'POST',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true
                },
                data: {
                  username: that.app.get('username'),
                  token: that.app.get('token'),
                  replyId: x
                },
                success: function(msg) {
                  alert(msg);
                },
                error: function() {
                  alert('upvote failed');
                }
              });
            };
          })();




          var replyContentBox = $reply.children('.detailReplyClear').children('.replyContentBox');

          if (!comments[i].responses[j].replies[k].image) {
            $reply.children('.detailReplyClear').children('.detailReplyImage').css('width', '0px');
          } else {
            replyContentBox.hasImage = true;
            $reply.children('.detailReplyClear').children('.detailReplyImage').attr('src', comments[i].responses[j].replies[k].image);
            (function() {
              var image = comments[i].responses[j].replies[k].image;
              var on = false;
              $reply.children('.detailReplyClear').children('.detailReplyImage')[0].onclick = function(e) {
                e.stopPropagation();
                if (!on) {
                  on = true;
                  var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ image +'"></img></div>')
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
          }
          this.replyContentBoxes.push(replyContentBox);


          var $replyReplyButton = $reply.children('.detailReplyClear').children('div.replyButton');



          $responseExpansionBox.append($reply);

        }




         
      }

    }

    var $spacer = $('<div class="spacer"></div>');
    this.$el.children('#conversationWrapper').append($spacer);







     //MAYBE JUST LOOP THROUGH SUBVIEWS AND PUT RESIZE LISTENER ON
      //PARENT SO THAT IT IS AUTOMATICALLY UNBOUND???

    //have to reset all the content widths that are next
    //to images
    var throttledResize = _.throttle(function() {



      //SO ROUGH

      var detailTopicWidth = $('#content2').width();
      
      if (that.topicContentBox.hasImage) {
        that.topicContentBox.css('width', (detailTopicWidth - 200) + 'px');
      }

      for (var i=0; i < that.commentContentBoxes.length ;i++) {
        //SOOOO HACKY AHHHHHHHH
        if (that.commentContentBoxes[i].hasImage) {
          that.commentContentBoxes[i].css('width', (detailTopicWidth - 160) + 'px');
        }

      }

      for (var i=0; i < that.responseContentBoxes.length ;i++) {
        if (that.responseContentBoxes[i].hasImage) {
          that.responseContentBoxes[i].css('width', (0.9 * detailTopicWidth - 160) + 'px');
        }
      }

      for (var i=0; i < that.replyContentBoxes.length ;i++) {
        if (that.replyContentBoxes[i].hasImage) {
          that.replyContentBoxes[i].css('width', (0.8 * detailTopicWidth - 160) + 'px');
        }
      }


      //THROTTLE TIME (PERHAPS VARY THIS DEPENDING ON USER AGENT??)
    }, 100);


    $(window).on('resize', throttledResize);

    throttledResize();
    setTimeout(throttledResize, 20);


  },//end render()


  goToUser: function(user) {
    var that = this;
    $.ajax({
      url: 'http://liveworld.io:80/user',
      // url: 'http://localhost:80/user',
      method: 'GET',
      crossDomain: true,
      data: {
        username: user,
        //so that this is never cached
      },
      success: function(data) {
        if (data) {

          console.log('whaaa');
          that.app.get('detailView').displayed = 'Users';
          console.log('server returned: ', data);

          //SERVER NEEDS TO RETURN WHETHER A USER IS A CONTACT OR NOT......

          that.app.get('content2').show(that.app.get('detailView'), data[0]);
        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });
  },





  openInputBox: function(data) {
    var that = this;
    this.responding = true;
    this.responseData = data;
    $('textarea#inputTextArea').val('');
    if (data.type === 'Reply') {
      $('textarea#inputTextArea').val('@'+data.username);
    }
    $('#inputBox').css('height', '100px');





    var ajaxing = false;
    var sendHandler = function() {

      if (!ajaxing) {

          ajaxing = true;

          var fd = new FormData();    
          fd.append( 'file', $('#imageInput')[0].files[0] );
          fd.append( 'username', that.app.get('username') );
          fd.append( 'token', that.app.get('token') );

          fd.append( 'headline', $('textarea#inputHeadlineTextArea').val() );

          fd.append( 'link', $('textarea#inputTextArea').val() );

          fd.append( 'contents', $('textarea#inputTextArea').val() );

          fd.append( 'location', data.location );
          //fd.append( 'origin', that.app.get('origin') );
          fd.append( 'channel', data.channel );

          fd.append( 'topicId', data.topicId );
          fd.append( 'commentId', data.commentId );
          fd.append( 'responseId', data.responseId );

          //whaaaa
          var thet = this;

          $.ajax({
            url: 'https://liveworld.io:443/' + data.urlSuffix,
            // url: 'http://localhost/' + data.urlSuffix,
            method: 'POST',
            crossDomain: true,
            xhrFields: {
              withCredentials: true
            },
            contentType: false,
            processData: false,
            data: fd,
            success: function(msg) {

              $('#inputBox').css('height', '0px');
              alert(msg);
              //WHOAH CAN I DIRECTLY APPEND HERE AND SPOOF IT?? YESSSSS

              //that.app.trigger('reloadSidebarTopics');
              //just reload fuck it
              setTimeout(function() {

                ajaxing = false;

                $.ajax({
                  url: 'http://liveworld.io/topicTree',
                  // url: 'http://localhost/topicTree',
                  method: 'GET',
                  crossDomain: true,
                  data: {
                    //these two models are different scope!
                    topicId: that.model.id
                  },
                  success: function(model) {

                    that.app.get('content2').show(that.app.get('detailView'), model);
                  },
                  error: function() {
                    alert('server error');
                  }
                });

              }, 1000);

            },
            error: function() {
              alert('server error');
              ajaxing = false;
            }
          });


      }



    };//end post button handler



    this.enterHandler = function(e) {

      if (e.keyCode === 13 && $('#inputTextArea').is(':focus') && $('#inputTextArea').val() !== '') {

        sendHandler();

      }

    };


    $(window).keypress(this.enterHandler);

    console.log(this.$el);
    this.$el.children('#inputBox').children('#inputBoxButton')[0].onclick = function() {

      sendHandler();

    };

    
  },


  closeInputBox: function() {
    //why lol
    $(window).unbind('keypress', this.enterHandler);
    this.responding = false;
    $('#inputBox').css('height', '0px');

  },





  close: function() {
    this.closeInputBox;
    $(window).unbind('keypress', this.enterHandler);
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});
