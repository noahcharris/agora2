window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//MORE LIKE A 'CONVERSATION VIEW', think facebook

//yeah need to rename this
Agora.Views.DetailMessageEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.template = _.template( $('#detailMessageEntryTemplate').html() );
    this.messageInputTemplate = _.template( $('#messageInputBoxTemplate').html() );
    this.app = appController;
  },

  render: function(model2) {

    var that = this;

    //MOAR MOCK DATA LIKE THIS
    this.model = this.model || [{
      sender: 'mock data',
      recipient: 'mock data',
      contents: 'mockingbirg'
    }];
    
    console.log('object: :::', this.model.entries.length);
    for (var i = 0; i<this.model.length ;i++) {
      this.$el.prepend(this.template(this.model[i]));
      console.log(this.model[i]);
    }

    this.$el.append('<div class="spacer"></div>')

    //NEED TO SCROLL TO BOTTOM ONCE THESE ARE ALL PREPENDED

    this.$el.append( $(this.messageInputTemplate()) );

    var $sendButton = this.$el.children('#messageInputBox').children('#messageInputBoxButton');
    $sendButton.on('click', function() {
      console.log($('#messageInputTextArea').val());


      $.ajax({
        url: 'http://localhost:80/sendMessage',
        method: 'POST',
        crossDomain: true,
        data: {
          sender: that.app.get('username'),
          //THIS IS THE WHOLE POINT OF MODEL2 !!!!!!!!!!!!!
          recipient: model2.contact,
          contents: $('#messageInputTextArea').val()
        },
        success: function(data) {
          if (data) {
            alert(data);
            $('#messageInputTextArea').val('');
          } else {
            $('#messageInputTextArea').val('');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });




    });

    //need to loop through and set out all the messages in the object






  },

  close: function() {
    this.remove();
    this.unbind();
  }


});