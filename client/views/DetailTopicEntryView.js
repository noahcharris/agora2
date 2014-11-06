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

  },

  render: function() {

    var that = this;

    //append topic box
    this.$el.append( this.topicTemplate(this.model) );

    var comments = this.model.comments;


    //$starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
    //$shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
    //this.$el.children('div.topicBox').children('div.topicContentBox').append($starIcon);
    //this.$el.children('div.topicBox').children('div.topicContentBox').append($shareIcon);


    var $topicReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');
    //sending data to the response box
    $topicReplyButton.on('click', function() {
      
      var responseParams = {
        type: 'Topic',
        location: that.app.get('mapController').get('location'),
        group: that.app.get('mapController').get('group'),
        topic: that.model.id
      }

      that.app.get('detailView').openResponseBox(responseParams);

    });
    this.$el.children('div.topicBox').children('div.topicContentBox').append($topicReplyButton);




    for (var i=0;i<comments.length;i++) {
      
      var $commentReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');

      //sending data to the response box
      var a = function() {
        var x = i;
        $commentReplyButton.on('click', function() {
          var responseParams = {
            type: 'Comment',
            location: that.app.get('mapController').get('location'),
            group: that.app.get('mapController').get('group'),
            topic: that.id,
            comment: comments[x].id
          }
          that.app.get('detailView').openResponseBox(responseParams);
        });
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

      var commentCollapsed = true;

      //this fixed the problem like in detailView, but why??
      $expandCommentButton[0].onclick = function(e) {
        if (!commentCollapsed) {

          //TODO
          $(e.target).parent().next().css('height', '0px');
          $(e.target).attr('src', 'resources/images/expand.png');
          commentCollapsed = true;
        } else if (commentCollapsed) {

          //TODO

          //well, there it is. will have to also change parent values in the response expansion
          var height = 0;
          console.log($(e.target).parent().next().children());
          $(e.target).parent().next().children().each(function(index) {
            console.log($(this).height());
            height += $(this).height();
            console.log('hwhw', height);
          });

          console.log('height: ', height);

          $(e.target).parent().next().css('height', height + 'px');

          $(e.target).attr('src', 'resources/images/contract.png');
          commentCollapsed = false;
        }
      };

      $comment.append($expandCommentButton);

      this.$el.append($commentExpansionBox);


      for (var j=0;j<comments[i].responses.length;j++) {

        var $responseReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');

        //sending data to the response box
        var b = function() {
          var x = i;
          var y = j;
          $responseReplyButton.on('click', function() {
            var responseParams = {
              type: 'Reply',
              location: that.app.get('mapController').get('location'),
              group: that.app.get('mapController').get('group'),
              topic: that.model.id,
              comment: comments[x].id,
              username: comments[x].responses[y].poster
            }
            that.app.get('detailView').openResponseBox(responseParams);
          });
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

        var responseCollapsed = true;

        //this fixed the problem like in detailView, but why??
        $expandResponseButton[0].onclick = function(e) {
          console.log('whaha');
          if (!responseCollapsed) {

            var x = $(e.target).parent().next().height();

            //TODO
            $(e.target).parent().next().css('height', '0px');

            var y = $(e.target).parent().parent().height();
            $(e.target).parent().parent().css('height', y - x + 'px');
            console.log(y);



            $(e.target).attr('src', 'resources/images/expand.png');
            responseCollapsed = true;
          } else if (responseCollapsed) {

            //TODO
            // $(e.target).parent().next().css('height', 'auto');
            // $(e.target).attr('src', 'resources/images/contract.png');
            // responseCollapsed = false;


            var height = 0;
            console.log($(e.target).parent().next().children());
            $(e.target).parent().next().children().each(function(index) {
              console.log($(this).height());
              height += $(this).height();
              console.log('hwhw', height);
            });

            console.log('height: ', height);

            $(e.target).parent().next().css('height', height + 'px');

            //NEED TO CHANGE PARENT AS WELL, BECAUSE THEY ARE NESTED
            var x = $(e.target).parent().parent().height();
            $(e.target).parent().parent().css('height', x + height + 'px');
            console.log(x);


            $(e.target).attr('src', 'resources/images/contract.png');
            responseCollapsed = false;

          }
        };

        $response.append($expandResponseButton);

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

  close: function() {
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});
