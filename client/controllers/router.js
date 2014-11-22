window.Agora = window.Agora || {};

Agora.Router = Backbone.Router.extend({


  //NEED TO ADD ROUTES FOR INDIVIDUAL USERS AND TOPICS

  routes: {
    '': 'index',
    'World*path': 'path',
    'world*path': 'path',
    'User/:user': 'user',
    'user/:user': 'user',
    'Topic/:topic': 'topic',
    'topic/:topic': 'topic'
  },

  initialize: function(appController) {
    this.app = appController;
  },

  index: function() {
    this.navigate('World');
  },

  path: function(path) {
    if (path) {
      //TODO
    } else {
      this.app.get('mapController').showWorld();
    }
  },

  user: function(input) {
    //SHOW THE USER PROFILE
  },

  topic: function(input) {
    //SHOW THE TOPIC, AT THE TOP OF ITS ORIGIN
  }

  
});
