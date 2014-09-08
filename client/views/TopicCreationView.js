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

  },

  setHandlers: function() {
    var that = this;
    this.$el.children('button').on('click', function() {

      if (that.app.get('sidebarView').displayed === 'Topics') {

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
      } else if (that.app.get('sidebarView').displayed === 'GroupTopics') {
        $.ajax({
          url: 'createGroupTopic',
          method: 'POST',
          data: {
            headline: that.$el.children('input#topicCreationHeadline').val(),
            link: that.$el.children('input#topicCreationLink').val(),
            content: that.$el.children('textarea').val(),
            location: that.app.get('mapController').get('location'),
            group: that.app.get('mapController').get('group')
          },
          success: function(msg) {
            alert(msg);
            that.app.get('content2').show(that.app.get('detailView'));
            that.app.get('mapController').trigger('reloadGroupSidebar', {
              location: that.app.get('mapController').get('location'),
              group: that.app.get('mapController').get('group')
            });
          },
          error: function() {
            alert('post creation failed');
          }
        });
      } else if (that.app.get('sidebarView').displayed === 'SubgroupTopics') {

        //TODO

        $.ajax({
          url: 'createSubgroupTopic',
          method: 'POST',
          data: {
            headline: that.$el.children('input#topicCreationHeadline').val(),
            link: that.$el.children('input#topicCreationLink').val(),
            content: that.$el.children('textarea').val(),
            location: that.app.get('mapController').get('location'),
            group: that.app.get('mapController').get('group').split('/')[0],
            subgroup: that.app.get('mapController').get('group').split('/')[1]
          },
          success: function(msg) {
            alert(msg);

            //see how the third parameter on the trigger is 'name'? that is a problem,
            //have to find all places where it's triggered and change them

            that.app.get('content2').show(that.app.get('detailView'));
            that.app.get('mapController').trigger('reloadSubgroupSidebar', {
              location: that.app.get('mapController').get('location'),
              group: that.app.get('mapController').get('group').split('/')[0],
              name: that.app.get('mapController').get('group').split('/')[1]
            });
          },
          error: function() {
            alert('post creation failed');
          }
        });
      }


    });
  },

  close: function() {
    console.log('topic creation view closing');
    this.remove();
  }

});