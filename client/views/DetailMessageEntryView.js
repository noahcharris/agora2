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

    this.$el.unbind();
    this.$el.empty();


    this.$el.append($('<ul id="messageChain"></ul>'))

    //MOAR MOCK DATA LIKE THIS
    this.model = this.model || [{
      sender: 'mock data',
      recipient: 'mock data',
      contents: 'mockingbirg'
    }];
    
    var $messageChainList = this.$el.children('ul#messageChain');
    var height = 0;
    for (var i = 0; i<this.model.length ;i++) {
      //append the template inside a list element
      var $message = $('<li></li>').append(this.template(this.model[i]));
      $messageChainList.prepend($message);
      height += $message.height();
    }

    $messageChainList.append('<div class="spacer"></div>');
    console.log('hwohohwo: ', height);

    //LOL this will do for now
    setTimeout(function() {
      console.log($messageChainList.scrollTop());
      $messageChainList.scrollTop(9999999);
    }, 100);



    //NEED TO SCROLL TO BOTTOM ONCE THESE ARE ALL PREPENDED

    this.$el.append( $(this.messageInputTemplate()) );

    var $sendButton = this.$el.children('#messageInputBox').children('#messageInputBoxButton');
    $sendButton[0].onclick = function() {

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

            //reload message chain




            $.ajax({
              url: 'http://localhost/messageChain',
              method: 'GET',
              crossDomain: true,
              cache: false,
              data: {
                username: that.app.get('username'),
                contact: model2.contact
              },
              success: function(model) {
                //GAHHHHHHH SO HACKY FUCKKKK
                console.log('he');
                console.log(model);
                that.model = model;
                that.render(model2);
                // that.app.get('content2').show(that.app.get('detailView'), model, model2);
                // thet.$el.addClass('highlight');
              },
              error: function() {
                alert('server error');
              }
            });






          } else {
            $('#messageInputTextArea').val('');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });




    };

    //need to loop through and set out all the messages in the object






  },

  close: function() {
    this.remove();
    this.unbind();
  }


});