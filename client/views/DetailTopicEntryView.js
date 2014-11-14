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

  },

  render: function() {

    var that = this;







    console.log('whoooooo rendering this.model: ', this.model);









    //∆∆∆∆∆∆∆∆∆∆∆∆ GOING TO MOVE ALL THIS code into detailTopicEntryView ∂∂∂∂∂∂∂∂∂∂∂∂∂∂∂∂∂∂


    // ## RESPONSE BOX ##
    //console.log('appending response box in render responding: ',this.responding);
    //USE this.responseData here so users won't lose their changes

    //!!!!!

    //##############################
    //####### RESPONSE BOX #########
    //##############################

    //MESSAGE BOX DOESN'T POST WITHIN GROUPS YET
    this.$el.append(this.inputBoxTemplate());
    this.$el.children('div#inputBox').css('height', '0px');
    this.$el.children('div#inputBox').children('div#inputBoxButton').on('click', function(e) {

      var headline = that.$el.children('div#inputBox').children('textarea#inputHeadlineTextArea').val();
      var content = that.$el.children('div#inputBox').children('textarea#inputTextArea').val();
      var location = that.app.get('mapController').get('location');
      that.$el.children('div#inputBox').children('textarea').val('');

      //wtf is this reponsedata shit
      // if (that.responseData.type === 'Topic') {
      //   $.ajax({
      //     url: 'createComment',
      //     method: 'POST',
      //     data: {
      //       location: that.responseData.location,
      //       group: that.responseData.group,
      //       topic: that.responseData.topic,
      //       headline: headline,
      //       content: content
      //     },
      //     success: function(data) {
      //       alert(data);
      //       //append their comment anyways?
      //       that.app.get('mapController').trigger('reloadSidebar', location);
      //     },
      //     error: function() {
      //       //TODO
      //     }
      //   });
      // } else if (that.responseData.type === 'Comment') {

      //   //TODO
      //   //send a response generating ajax request


      // } else if (that.responseData.type === 'Response' ||
      //   that.responseData.type === 'Reply') {

      //   $.ajax({
      //     url: 'createReply',
      //     method: 'POST',
      //     data: {
      //       location: that.responseData.location,
      //       group: that.responseData.group,
      //       topic: that.responseData.topic,
      //       comment: that.responseData.comment,
      //       headline: headline,
      //       content: content
      //     },
      //     success: function(data) {
      //       alert(data);
      //       //append their reply
      //       //reload the proper sidebar
      //       that.app.get('mapController').trigger('reloadSidebar', location);
      //     },
      //     error: function() {
      //       //TODO
      //     }
      //   });

      // }

    });

    this.$el.children('#inputBox').append($('<img src="resources/images/x.png" class="x"></img>'));
    console.log(this.$el.children('#inputeBox').children('img.x'));
    this.$el.children('#inputBox').children('img.x')[0].onclick = function() {
      that.closeInputBox();
    };




    if (this.responding) {
      //why do I need to use this selector?
      console.log('whaaaaat');
      this.$el.children('div#inputBox').css('height', '100px');
    }























    //append topic box
    this.$el.append( this.topicTemplate(this.model) );

    //add upvote handling
    var $upvote = this.$el.children('div.topicBox').children('div.topicUpvoteBox').children('img');
    $upvote[0].onclick = function() {

      $.ajax({
        url: 'http://localhost/upvoteTopic',
        method: 'POST',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
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


    var $topicReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');
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
    this.$el.children('div.topicBox').children('div.topicContentBox').append($topicReplyButton);




    for (var i=0;i<comments.length;i++) {
      
      var $commentReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');

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

      var $comment = $(this.commentTemplate(comments[i]));
      $comment.children('div.commentContentBox').append($commentReplyButton);
      //$starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
      //$shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
      //$comment.children('div.commentContentBox').append($starIcon);
      //$comment.children('div.commentContentBox').append($shareIcon);

      //APPEND COMMENT TO OUTERBOX
      this.$el.append( $comment );

      var $commentExpansionBox = $('<div class="commentExpansionBox">');
      var $expandCommentButton = $('<img src="resources/images/expand.png" class="expandCommentButton"></img>');


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

      $comment.children('div.commentToolbox').append($expandCommentButton);
      //$comment.append($expandCommentButton);

      this.$el.append($commentExpansionBox);


      for (var j=0;j<comments[i].responses.length;j++) {

        var $responseReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');

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


        var $response = $(this.responseTemplate(comments[i].responses[j]));
        $response.append($responseReplyButton);

        //$comment.children('div.replyContentBox').append($replyReplyButton);

        //$starIcon = $('<img height="20px" width="20px" src="resources/images/star.png"></img>');
        //$shareIcon = $('<img height="20px" width="20px" src="resources/images/share.png"></img>');
        //$comment.children('div.replyContentBox').append($starIcon);
        //$comment.children('div.replyContentBox').append($shareIcon);

        var $responseExpansionBox = $('<div class="responseExpansionBox">');
        var $expandResponseButton = $('<img src="resources/images/expand.png" class="expandResponseButton"></img>');


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
              console.log(y);



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
                console.log('hwhw', height);
              });

              console.log('height: ', height);

              $(e.target).parent().parent().next().css('height', height + 'px');

              //NEED TO CHANGE PARENT AS WELL, BECAUSE THEY ARE NESTED
              var x = $(e.target).parent().parent().parent().height();
              $(e.target).parent().parent().parent().css('height', x + height + 'px');
              console.log(x);


              $(e.target).attr('src', 'resources/images/contract.png');
              responseCollapsed = false;

            }
          };

        }
        d();

        $response.children('.responseToolbox').append($expandResponseButton);

        $commentExpansionBox.append($response);

        $commentExpansionBox.append($responseExpansionBox);

        for (var k=0;k<comments[i].responses[j].replies.length;k++) {

          var $reply = $( this.replyTemplate(comments[i].responses[j].replies[k]) );
          $responseExpansionBox.append($reply);

        }


         
      }

    }

    var $spacer = $('<div class="spacer"></div>');
    this.$el.append($spacer);


  },





  openInputBox: function(data) {
    var that = this;
    console.log('respond neto: ', data);
    this.responding = true;
    this.responseData = data;
    $('textarea#inputTextArea').val('');
    if (data.type === 'Reply') {
      $('textarea#inputTextArea').val('@'+data.username);
    }
    $('#inputBox').css('height', '100px');

    $('#inputBoxButton')[0].onclick = function() {


      //whaaaa
      var thet = this;

      $.ajax({
        url: 'http://localhost/' + data.urlSuffix,
        method: 'POST',
        crossDomain: true,
        data: {
          username: that.app.get('username'),
          headline: $(thet).parent().children('textarea#inputHeadlineTextArea').val(),
          link: $(thet).parent().children('textarea#inputTextArea').val(),
          content: $(thet).parent().children('textarea#inputTextArea').val(),
          location: data.location,
          channel: data.channel,
          topicId: data.topicId,
          commentId: data.commentId,
          responseId: data.responseId
        },
        success: function(msg) {

          $('#inputBox').css('height', '0px');
          alert(msg);

          //WHOAH CAN I DIRECTLY APPEND HERE AND SPOOF IT?? YESSSSS

          //that.app.trigger('reloadSidebarTopics');
          //just reload fuck it
          setTimeout(function() {

            $.ajax({
              url: 'http://localhost/topicTree',
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
        }
      });


    };



  },

  //for selecting different replies/comments/topics
  respondTo: function(data) {

  },

  closeInputBox: function() {
    //why lol
    console.log('whooaahahahah');
    this.responding = false;
    $('#inputBox').css('height', '0px');

  },





  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});
