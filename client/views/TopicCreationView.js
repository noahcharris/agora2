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


    this.$el.append($('<img src="resources/images/x.png" class="x"></img>'));
    this.$el.children('img.x').on('click', function() {
      that.app.get('content2').hide();
    });

    //this.$el.append( $('<button>Upload Image</button><br/><br/>') );
    this.$el.append( $('<button>Post</button>') );

    var location = that.app.get('mapController').get('location') || 'World';
    this.$el.append( $('<p>Location:&nbsp' + location + '</p>'))
    this.$el.append( $('<p>Channel:&nbsp' + that.app.get('channel') + '</p>'))

  },

  setHandlers: function() {
    var that = this;
    this.$el.children('button').on('click', function() {

        if (that.app.get('login')) {
          $.ajax({
            url: 'createTopic',
            method: 'POST',
            data: {
              headline: that.$el.children('input#topicCreationHeadline').val(),
              link: that.$el.children('input#topicCreationLink').val(),
              content: that.$el.children('textarea#topicCreationContent').val(),
              location: that.app.get('mapController').get('location')
            },
            success: function(msg) {
              alert(msg);
              that.app.get('content2').show(that.app.get('detailView'));
              that.app.get('mapController').trigger('reloadSidebar',
                that.app.get('mapController').get('location'));
            },
            error: function() {
              alert('post creation failed');
            }
          });
        } else {
          alert('must be logged in to create a topic');
        }



    });
  },

  close: function() {
    console.log('topic creation view closing');
    this.remove();
  }

});