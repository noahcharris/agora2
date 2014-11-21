window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.DetailUserEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function(appController) {
    this.app = appController;
    this.template = _.template( $('#detailUserEntryTemplate').html() );
  },

  render: function() {
    var that = this;
    console.log(this.model);
    this.$el.html( this.template(this.model) );
    var $messageButton = $('<button>SEND MESSAGE</button>');
    $messageButton[0].onclick = function(params) {
      //OPEN UP THE CONVO WITH CONTACT IF IT EXISTS (CONVERSATION VIEW)
      //OTHERWISE TAKE THE USER TO A MESSAGE CREATION VIEW
      var chains = that.app.get('sidebarView').messagesCollection;
      var offsetCount = -1;
      for (var i=0; i < chains.length ;i++) {

        offsetCount++;

        //will need to account for pagination here eventually

        if (chains[i].contact === that.model.username) {
          //open up this shit

          that.app.get('sidebarView').displayed = 'Messages';
          that.app.get('detailView').displayed = 'Messages';

          that.app.get('content1').show(that.app.get('sidebarView'));

          $.ajax({
            url: 'http://localhost/messageChain',
            method: 'GET',
            crossDomain: true,
            data: {
              username: that.app.get('username'),
              contact: chains[i].contact
            },
            success: function(model) {
              that.app.get('content2').show(that.app.get('detailView'), model);
              that.app.get('sidebarView').highlightCell(offsetCount);
            },
            error: function() {
              alert('server error');
            }
          });

        }

      }

      //CREATE NEW CHAIN HERE

    };


    var $contactButton = $('<button>Contact Request</button>');
    $contactButton.on('click', function() {
      //ajax
    });

    //MAYBE ONLY DO THIS FOR A LITTLE WHILE AFTER THE PROFILE HAS BEEN UPDATED??????
    var suffix = '';
    if (this.model.username === this.app.get('username')) {
      suffix = '?extra=' + Math.floor((Math.random() * 10000) + 1);
    }
    this.$el.children('#profileColumnWrapper').children('#profilePicture').attr('src', this.model.image + suffix);

    var $toolColumn = this.$el.children('#profileColumnWrapper').children('div#profileRightColumn');
    //need to return whether the user is a contact or not...
    if (this.model.username !== this.app.get('username')) {
      $toolColumn.append($messageButton);
      if (!this.model.isContact) {
        $toolColumn.append($('<br/>'));
        $toolColumn.append($contactButton);
      }

    }

  },

  close: function() {
    this.remove();
    this.unbind();
  }


});