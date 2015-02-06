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

    //translation
    var headlineLabel = this.app.translate('Headline');
    var linkLabel = this.app.translate('Link');
    var contentLabel = this.app.translate('Content');
    this.$el.children('#topicCreationHeadline').attr('placeholder', headlineLabel);
    this.$el.children('#topicCreationLink').attr('placeholder', linkLabel);
    this.$el.children('#topicCreationContent').attr('placeholder', contentLabel);

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



    this.$el.append($imageInput);
    this.$el.append($imagePreview);



    var postLabel = this.app.translate('Post');
    this.$el.append( $('<br/><br/><button id="topicCreationPostButton">'+postLabel+'</button>') );

    var location = that.app.get('mapController').get('location') || 'World';
    this.$el.append( $('<p>Location:&nbsp' + location + '</p>'))
    this.$el.append( $('<p>Channel:&nbsp' + that.app.get('channel') + '</p>'))


    var ajaxing = false;
    this.$el.children('button').on('click', function() {

        if (that.app.get('login')) {


          //NEED TO CHECK FOR THINGS, INCLUDING CAPTCHA

          if (!$('.g-recaptcha-response').val()) {
            alert(that.app.translate('please complete CAPTCHA'));
          } else if (that.$el.children('input#topicCreationHeadline').val() === ''
            && that.$el.children('textarea#topicCreationContent').val() === '') {
            alert(that.app.translate('you must provide either a headline or contents'));
          } else {

                if (!ajaxing) {

                  ajaxing = true;

                  var fd = new FormData();    
                  fd.append( 'file', $('#imageInput')[0].files[0] );
                  fd.append( 'username', that.app.get('username') );
                  fd.append( 'token', that.app.get('token') );
                  fd.append( 'headline', that.$el.children('input#topicCreationHeadline').val() );
                  fd.append( 'link', that.$el.children('input#topicCreationLink').val() );
                  fd.append( 'contents', that.$el.children('textarea#topicCreationContent').val() );
                  fd.append( 'location', that.app.get('mapController').get('location') );
                  //this is not utilized..
                  fd.append( 'origin', that.app.get('origin') );
                  fd.append( 'channel', that.app.get('channel') );
                  fd.append( 'responseString', $('.g-recaptcha-response').val() );

                  

                  $.ajax({
                    url: 'https://egora.co:443/createTopic',
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
                        alert(that.app.translate('please make sure that your file size is not over 10MB'));
                      } else {
                        that.app.get('sidebarView').displayed = 'Topics-New'
                        that.app.get('content2').hide();
                        that.app.trigger('reloadSidebarTopics');  
                      }
                    },
                    error: function() {
                      alert(that.app.translate('post creation failed :('));
                      ajaxing = false;
                    }
                  });


                }


            
          }



        } else {
          alert(that.app.translate('you must be logged in to create a topic'));
        }

    });//end create topic button

    setTimeout(function() {
      that.$el.children('#topicCreationHeadline').focus();
    }, 1000);



  },

  setHandlers: function() {

  },

  close: function() {
    console.log('topic creation view closing');
    this.remove();
  }

});