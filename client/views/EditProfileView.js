window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.EditProfileView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryView',

  initialize: function(appController) {
    this.app = appController;
    //this.template = _.template( $('#editViewTemplate').html() );
    this.$el.addClass('detailView');
    this.userData = null;
  },

  render: function() {
    var that = this;
    this.$el.empty();

    var $x = $('<img src="resources/images/x.png" class="x"></img>')


    this.$el.append( $x );

    this.$el.children('img.x')[0].onclick = function() {
      that.app.get('sidebarView').removeHighlights();
      that.app.get('content2').hide();
    }



    var $profilePicture = $('<img height="150px" width="150px"></img>');
    var $imageInput = $('<input type="file" id="imageInput"></input>');
    var $textArea = $('<textArea id="editAboutMe" height="200px" width="300px"></textarea>');

    this.$el.append($profilePicture);
    this.$el.append('<br/>');
    this.$el.append($imageInput);
    this.$el.append('<br/>');
    this.$el.append('<br/>');
    this.$el.append('<br/>');
    this.$el.append('<h4>ABOUT ME:</h4>');
    that.$el.append($textArea);
    this.$el.append('<br/>');
    this.$el.append('<br/>');
    this.$el.append('<br/>');
    this.$el.append('<br/>');


    $.ajax({
      url: 'http://54.149.63.77:80/user',
      // url: 'http://localhost:80/user',
      method: 'GET',
      crossDomain: true,
      data: {
        username: that.app.get('username')
      },
      success: function(data) {
        if (data) {
          console.log('server returned: ', data);

          this.userData = data[0];

          $profilePicture.attr('src', data[0].image);

          $textArea.val(data[0].about);

        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });


    $imageInput.on('change', function(e) {
      var reader = new window.FileReader()
      reader.onload = function(e) {
        $profilePicture.attr('src', e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    });

    var $saveChangesButton = $('<button>Save Changes</button>');
    $saveChangesButton[0].onclick = function() {


      //SECURITYYYYYY???????????!!!!!!!!
      var fd = new FormData();    
      console.log($('#imageInput'));
      fd.append( 'file', $('#imageInput')[0].files[0] );
      fd.append( 'username', that.app.get('username') );
      fd.append( 'about', $textArea.val());

      console.log('FORM: ', fd);

      // $.ajax({
      //   url: 'http://localhost:80/updateUserImage',
      //   method: 'POST',
      //   cache: false,
      //   contentType: 'application/json',
      //   crossDomain: true,
      //   processData: false,
      //   data: fd,
      //   success: function(data) {
      //     alert(data);
      //   }, error: function(err) {
      //     console.log('ajax error ocurred: ', err);
      //   }

      // });


      $.ajax({
        // url: 'http://localhost:80/updateUserProfile',
        url: 'http://54.149.63.77:80/updateUserProfile',
        method: 'POST',
        crossDomain: true,
        contentType: false,
        processData: false,
        data: fd,
        success: function(data) {
          alert(data);

          
          //NOOOOOOO DON't DOOOO THIS

          $.ajax({
            url: 'http://54.149.63.77:80/user',
            // url: 'http://localhost:80/user',
            method: 'GET',
            crossDomain: true,
            data: {
              username: that.app.get('username'),
              //so that this is never cached
              extra: Math.floor((Math.random() * 10000) + 1)
            },
            success: function(data) {
              if (data) {
                that.app.get('detailView').displayed = 'Users';
                console.log('server returned: ', data);


                //CHECK TO SEE IF THE USERNAME IS THE USER AND GENERATE A RANDOM STRING TO 
                //ATTACH TO THE REQUEST SO THAT WE DON'T CACHE THE IMAGE
                //SO THAT CHANGING A PROFILE PICTURE IS A SEAMLESS EXPERIENCE

                //JUST GOING TO DO THIS FOR NOW, BUT I NEED A SYSTEM
                //SAME SITUATION AS UPVOTES AND EXPAND/CONTRACT
                data[0].isContact = true;

                that.app.get('content2').show(that.app.get('detailView'), data[0]);
              } else {
                console.log('no data returned from server');
              }
            }, error: function(err) {
              console.log('ajax error ocurred: ', err);
            }

          });







        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

    };
    this.$el.append($saveChangesButton);



    //maybe pull the users profile in here for use with the edit view
    //prepopulate the fields with current data?

    //do we even need template?
    //this.$el.append( this.template() );
  },

  setHandlers: function() {

  },

  close: function() {
    console.log('registrationView closing');
    console.log(this);
    this.remove();
  }


});




