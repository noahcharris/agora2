window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.AlertView = Backbone.View.extend({


  tagName: 'div',

  className: 'alertView',

  initialize: function(appController) {
    this.searchTemplate = _.template( $('#alertSearchTemplate').html() );
    this.followupSuccessTemplate = _.template( $('#alertFollowupSuccessTemplate').html() );
    this.followupFailureTemplate = _.template( $('#alertFollowupFailureTemplate').html() );
    this.groupCreationSuccessTemplate = _.template( $('#alertGroupCreationSuccessTemplate').html() );
    this.groupCreationFailureTemplate = _.template( $('#alertGroupCreationFailureTemplate').html() );

    this.app = appController;

    //this is like sidebarView.displayed
    this.mode = 'Search';

  },

  render: function() {

    var that = this;
    this.$el.empty();

    if (this.mode === 'Search') {  
      this.$el.html(this.searchTemplate());
      console.log(this.$el);
    } else if (this.mode === 'FollowupSuccess') {
      this.$el.append($('<p class="x">X</p>'));
      this.$el.children('p.x').on('click', function() {
        that.app.get('content2').hide();
      });
      this.$el.append(this.followupSuccessTemplate());
    } else if (this.mode === 'FollowupFailure') {
      //probably display the registration view again on failure

    } else if (this.mode === 'GroupCreationSuccess') {
      this.$el.append($('<p class="x">X</p>'));
      this.$el.children('p.x').on('click', function() {
        that.app.get('content2').hide();
        that.app.get('content1').show(that.app.get('sidebarView'));
      });
      this.$el.append( this.groupCreationSuccessTemplate() );
    } else if (this.mode === 'GroupCreationFailure') {

    }

  },

  close: function() {
    console.log('alertView closing');
    this.remove();
    this.unbind();
  }

});