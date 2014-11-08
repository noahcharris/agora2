window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

//MORE LIKE A 'CONVERSATION VIEW', think facebook

Agora.Views.DetailMessageEntryView = Backbone.View.extend({

  tagName: 'div',

  className: 'detailEntryItem',

  initialize: function() {
    this.template = _.template( $('#detailMessageEntryTemplate').html() );
  },

  render: function() {

    console.log('whhhhhaaaa');

    this.model = this.model || {
      sender: 'mock data',
      recipient: 'mock data',
      contents: 'mockingbirg'
    };
    
    console.log('object: :::', this.model.entries.length);
    for (var i = 0; i<this.model.entries.length ;i++) {
      this.$el.append(this.template(this.model.entries[i]));
      console.log(this.model.entries[i]);
    }

    //need to loop through and set out all the messages in the object






  },

  close: function() {
    this.remove();
    this.unbind();
  }


});