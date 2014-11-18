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

          var $textArea = $('<textArea height="200px" width="300px"></textarea>');
          that.$el.append($textArea);
          $textArea.val(data[0].about);

          var $profilePicture = $('<img height="150px" width="150px" src="http://www.utne.com/~/media/Images/UTR/Editorial/Articles/Magazine%20Articles/2012/11-01/Anonymous%20Hacktivist%20Collective/Anonymous-Seal.jpg"></img>');
          that.$el.append($profilePicture);


        } else {
          console.log('no data returned from server');
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });




    var $saveChangesButton = $('<button>Save Changes</button>');
    $saveChangesButton[0].onclick = function() {
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


})