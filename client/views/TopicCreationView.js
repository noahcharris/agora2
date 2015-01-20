window.Agora = window.Agora || {};
window.Agora.View = window.Agora.Views || {};

Agora.Views.TopicCreationView = Backbone.View.extend({

  tagName: 'div',

  className: 'topicCreationView',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#topicCreationTemplate').html() );

    //DO THIS FOR ALL THE OTHERS
    this.$el.addClass('detailView');
  },

  render: function() {
    var that = this;

    this.$el.empty();
    this.$el.html( this.template() );

    this.$el.children('div#imageUploadButton').on('click', function() {
      console.log('aqua');
    });


    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });



    var $imageInput = $('<input type="file" id="imageInput"></input>');
    var $imagePreview = $('<br/><img height="150px" width="150px"></img>');

    $imageInput.on('change', function(e) {
      var reader = new window.FileReader()
      reader.onload = function(e) {
        $imagePreview.attr('src', e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    });

    if (window.File && window.FileReader) {
      console.log('ho');
    }


    this.$el.append($imageInput);
    this.$el.append($imagePreview);



    //this.$el.append( $('<button>Upload Image</button><br/><br/>') );
    this.$el.append( $('<br/><br/><button id="topicCreationPostButton">Post</button>') );

    var location = that.app.get('mapController').get('location') || 'World';
    this.$el.append( $('<p>Location:&nbsp' + location + '</p>'))
    this.$el.append( $('<p>Channel:&nbsp' + that.app.get('channel') + '</p>'))


    var ajaxing = false;
    this.$el.children('button').on('click', function() {

        if (that.app.get('login')) {

          if (!ajaxing) {

            ajaxing = true;

            var fd = new FormData();    
            console.log($('#imageInput'));
            fd.append( 'file', $('#imageInput')[0].files[0] );
            fd.append( 'username', that.app.get('username') );
            fd.append( 'token', that.app.get('token') );
            fd.append( 'headline', that.$el.children('input#topicCreationHeadline').val() );
            fd.append( 'link', that.$el.children('input#topicCreationLink').val() );
            fd.append( 'contents', that.$el.children('textarea#topicCreationContent').val() );
            fd.append( 'location', that.app.get('mapController').get('location') );
            fd.append( 'origin', that.app.get('origin') );
            fd.append( 'channel', that.app.get('channel') );

            

            $.ajax({
              url: 'https://liveworld.io:443/createTopic',
              // url: 'http://localhost/createTopic',
              method: 'POST',
              crossDomain: true,
              xhrFields: {
                withCredentials: true
              },
              contentType: false,
              processData: false,
              data: fd,
              success: function(msg) {
                ajaxing = false;
                if (msg[0] === 'e') {
                  alert('make sure that your file size is not over 25MB')
                } else {
                  that.app.get('sidebarView').displayed = 'Topics-New'
                  that.app.get('content2').hide();
                  that.app.trigger('reloadSidebarTopics');  
                }
              },
              error: function() {
                alert('post creation failed :(');
                ajaxing = false;
              }
            });


          }

        } else {
          alert('must be logged in to create a topic');
        }

    });//end create topic button




  },

  setHandlers: function() {

  },

  close: function() {
    console.log('topic creation view closing');
    this.remove();
  }

});