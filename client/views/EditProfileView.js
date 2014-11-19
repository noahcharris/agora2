window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.EditProfileView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryView',

  initialize: function(appController) {
    this.app = appController;
    //this.template = _.template( $('#editViewTemplate').html() );
    this.$el.addClass('detailView');
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



    var $textArea = $('<textArea height="200px" width="300px"></textarea>');
    var $profilePicture = $('<img height="150px" width="150px"></img>');


    $.ajax({
      url: 'http://localhost:80/user',
      method: 'GET',
      crossDomain: true,
      data: {
        username: that.app.get('username')
      },
      success: function(data) {
        if (data) {
          console.log('server returned: ', data);

          that.$el.append($textArea);
          $textArea.val(data[0].about);

          that.$el.append($profilePicture);
          $profilePicture.attr('src', 'http://www.utne.com/~/media/Images/UTR/Editorial/Articles/Magazine%20Articles/2012/11-01/Anonymous%20Hacktivist%20Collective/Anonymous-Seal.jpg');


        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });


    var $imageInput = $('<input type="file" id="imageInput"></input>');
    this.$el.append($imageInput);

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
        url: 'http://localhost:80/updateUserProfile',
        method: 'POST',
        crossDomain: true,
        contentType: false,
        processData: false,
        data: fd,
        success: function(data) {
          alert(data);
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




