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
    this.timer = null;
  },

  render: function(contact) {

    var that = this;

    this.$el.unbind();
    this.$el.empty();
    clearInterval(this.timer);

    this.$el.append($('<ul id="messageChain"></ul>'))

    //MOAR MOCK DATA LIKE THIS
    this.model = this.model || [{
      sender: 'mock data',
      recipient: 'mock data',
      contents: 'mockingbirg'
    }];


    
    var $messageChainList = this.$el.children('ul#messageChain');

    var count = 1;
    for (var i = 0; i<this.model.length ;i++) {
      //append the template inside a list element
      var $message = $('<li></li>').append(this.template(this.model[i]));
      $messageChainList.prepend($message);

    }


    //LOL this will do for now
    setTimeout(function() {
      $messageChainList.append('<div id="spacer"></div>');
      $messageChainList.scrollTop(9999999);

    }, 1);



    //NEED TO SCROLL TO BOTTOM ONCE THESE ARE ALL PREPENDED

    this.$el.append( $(this.messageInputTemplate()) );

    var $sendButton = this.$el.children('#messageInputBox').children('#messageInputBoxButton');
    $sendButton[0].onclick = function() {

      console.log($('#messageInputTextArea').val());

      $.ajax({
        url: 'http://54.149.63.77:80/sendMessage',
        // url: 'http://localhost:80/sendMessage',
        method: 'POST',
        crossDomain: true,
        data: {
          sender: that.app.get('username'),
          recipient: contact,
          contents: $('#messageInputTextArea').val()
        },
        success: function(data) {
          if (data) {
            alert(data);
            $('#messageInputTextArea').val('');

            //reload message chain

            that.app.get('cacheManager').updateMessageChain(contact);




            // $.ajax({
            //   url: 'http://54.149.63.77:80/messageChain',
            //   // url: 'http://localhost/messageChain',
            //   method: 'GET',
            //   crossDomain: true,
            //   cache: false,
            //   data: {
            //     username: that.app.get('username'),
            //     contact: contact
            //   },
            //   success: function(model) {

            //     that.app.get('cacheManager').updateMessageChain(contact);

            //   },
            //   error: function() {
            //     alert('server error');
            //   }
            // });






          } else {
            $('#messageInputTextArea').val('');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });




    };//end sendbutton onclick


    var timer = setInterval(function() {

      //need to call cache manager here to update this shit
      //maybe cache manager can just automatically insert into the tree
      //instead of calling render again, that would be dope!!!!!!!!!


      that.app.get('cacheManager').updateMessageChain(contact);

    }, 3000);
    this.timer = timer;

    //need to loop through and set out all the messages in the object






  },

  close: function() {
    clearInterval(this.timer);
    this.remove();
    this.unbind();
  }


});