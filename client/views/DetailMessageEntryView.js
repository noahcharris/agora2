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
    this.enterHandler = null;
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


    var sendLabel = this.app.translate('Send');
    var contentLabel = this.app.translate('Content');
    this.$el.append( $(this.messageInputTemplate( {sendLabel: sendLabel} )) );
    this.$el.children('#messageInputBox').children('#messageInputTextArea').attr('placeholder', contentLabel);

    var $sendButton = this.$el.children('#messageInputBox').children('#messageInputBoxButton');

    var ajaxing = false;

    var sendHandler = function() {

      if (!ajaxing) {

        ajaxing = true;
        $.ajax({
          url: 'https://liveworld.io:443/sendMessage',
          // url: 'http://localhost:80/sendMessage',
          method: 'POST',
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          data: {
            sender: that.app.get('username'),
            recipient: contact,
            contents: $('#messageInputTextArea').val(),
            token: that.app.get('token'),
            username: that.app.get('username')
          },
          success: function(data) {
            if (data) {
              //alert(data);
              ajaxing = false;
              $('#messageInputTextArea').val('');

              //reload message chain
              that.app.get('cacheManager').updateMessageChain(contact);

            } else {
              ajaxing = false;
              $('#messageInputTextArea').val('');
            }
          }, error: function(err) {
            ajaxing = false;
          }

        });

        
      }

    }


    this.enterHandler = function(e) {

      if (e.keyCode === 13 && $('#messageInputTextArea').is(':focus') && $('#messageInputTextArea').val() !== '') {

        sendHandler();

      }

    };


    $(window).keypress(this.enterHandler);


    $sendButton[0].onclick = function() {

      sendHandler();

    };



    var timer = setInterval(function() {

      that.app.get('cacheManager').updateMessageChain(contact);

    }, 3000);
    this.timer = timer;

    //need to loop through and set out all the messages in the object


    setTimeout(function() {
      $('#messageInputTextArea').focus();
    }, 1000);






  },

  close: function() {
    console.log('closing message view');
    clearInterval(this.timer);
    this.remove();
    $(window).unbind('keypress', this.enterHandler);
    this.unbind();
  }


});