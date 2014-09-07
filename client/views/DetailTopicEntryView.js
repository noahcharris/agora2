window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailTopicEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'detailEntryItem',

  initialize: function(appController) {

    //for sending to response box
    this.app = appController;

    this.topicTemplate = _.template( $('#detailTopicEntryTemplate').html() );
    this.commentTemplate = _.template( $('#detailCommentEntryTemplate').html() );
    this.replyTemplate = _.template( $('#detailReplyEntryTemplate').html() );

  },

  render: function() {

    var that = this;

    //need to set voted to true if already voted
    var voted = false;
      //$topicUpvote.on('click', function(e) {
      //console.log('topic upvote');
    //});
    this.$el.append( this.topicTemplate(this.model) );


    var comments = this.model.comments;

    var $outerbox = $('<div class="outerbox">');
    //need to switch the image on click..
    var $outerButton = $('<img src="/resources/images/expand.png" class="commentResizeButton"></img>');
    $outerbox.append($outerButton);

    //append buttons beneath the topic
    var $topicReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');
    this.$el.children('div.topicBox').children('div.topicContentBox').append($topicReplyButton);
    $starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
    $shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
    this.$el.children('div.topicBox').children('div.topicContentBox').append($starIcon);
    this.$el.children('div.topicBox').children('div.topicContentBox').append($shareIcon);


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


    //console.log('model expansion value ', this.model.get('expanded'));
    //these model properties (upvoted, expanded) are available for use
    var outerCollapsed = true;
    $outerButton.on('click', function(e) {
      if (outerCollapsed) {
        $(e.target).parent().css('height', 'auto');
        $(e.target).attr('src', 'resources/images/contract.png');
        outerCollapsed = false;
      } else if (!outerCollapsed) {
        $(e.target).parent().css('height', '150px');
        $(e.target).attr('src', 'resources/images/expand.png');
        outerCollapsed = true;
      }
    });

    for (var i=0;i<comments.length;i++) {
      

      var $commentReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');
      //sending data to the response box

      var a = function() {

        var x = i;

        //DO I NEED TO PASS SUBGROUP ALONG AS WELL???????????
        //SUBGROUP NEEDS ITS OWN VARIABLE IN mapController METHINKS
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
      //stars and shares for comments
      $starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
      $shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
      $comment.children('div.commentContentBox').append($starIcon);
      $comment.children('div.commentContentBox').append($shareIcon);

      $outerbox.append( $comment );
      var $innerbox = $('<div class="innerbox">');
      var $innerButton = $('<img src="resources/images/contract.png" class="replyResizeButton"></img>');
      $innerbox.append($innerButton);

      //$commentUpvote = $('<img src="upvote.jpeg" height="20px" width="20px"></img>');
      //$outerbox.append($commentUpvote);

      //Yo I am seriously proud of this, it keeps a new variable 
      //for each button using closure scope
      var f = function() {
        var innerCollapsed = false;
        $innerButton.on('click', function(e) {
          if (!innerCollapsed) {
            $(e.target).parent().css('height', '20px');
            $(e.target).attr('src', 'resources/images/expand.png');
            innerCollapsed = true;
          } else if (innerCollapsed) {
            $(e.target).parent().css('height', 'auto');
            $(e.target).attr('src', 'resources/images/contract.png');
            innerCollapsed = false;
          }
        });

        //need to set voted if user has already voted 
        var voted = false;
        //$commentUpvote.on('click', function(e) {
        //  console.log('comment upvote');
        //});

      };
      f();

      for (var j=0;j<comments[i].replies.length;j++) {

        var $replyReplyButton = $('<div class="replyButton"><span class="replyLabel">Reply</span></div>');

        //sending data to the response box
        var b = function() {

          var x = i;
          var y = j;

          $replyReplyButton.on('click', function() {
            var responseParams = {
              type: 'Reply',
              location: that.app.get('mapController').get('location'),
              group: that.app.get('mapController').get('group'),
              topic: that.model.id,
              comment: comments[x].id,
              username: comments[x].replies[y].poster
            }
            that.app.get('detailView').openResponseBox(responseParams);
          });
        };
        b();
        var $comment = $(this.replyTemplate(comments[i].replies[j]));
        $comment.children('div.replyContentBox').append($replyReplyButton);

        $starIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/star.png"></img>');
        $shareIcon = $('<img class="yolo" height="20px" width="20px" src="resources/images/share.png"></img>');
        $comment.children('div.replyContentBox').append($starIcon);
        $comment.children('div.replyContentBox').append($shareIcon);
  
        $innerbox.append( $comment );

        var f = function() {
          
          //need to set voted if already voted
          var voted = false;
          //$replyUpvote.on('click', function(e) {
          //  console.log('reply upvote');
          //});
        };
        f();
        
        
      }
      $outerbox.append($innerbox);

      //FOR DEMONSTRATION PURPOSES (starts out showing a comment)
      $outerbox.css('height', '150px');



    }
    this.$el.append($outerbox);
  },

  close: function() {
    console.log('closing DetailTopicEntryView');
    this.$el.empty();
    this.remove();
    this.unbind();
  }

});
