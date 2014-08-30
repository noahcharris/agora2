window.Agora = window.Agora || {};

Agora.Router = Backbone.Router.extend({


  //NEED TO ADD ROUTES FOR INDIVIDUAL USERS AND TOPICS

  routes: {
    '': 'index',
    'World~:group': 'worldGroupPath', //uppercase and lowercase versions of both
    'world~:group': 'worldGroupPath',
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
    this.path('');
  },

  path: function(path) {
    if (path) {
      this.app.get('mapController').goToPath(path.slice(1));
    } else {
      this.app.get('mapController').showWorld();
    }
  },

  worldGroupPath: function(input) {
    this.app.get('mapController').goToPath('~' + input);
  },

  user: function(input) {
    //SHOW THE USER PROFILE
  },

  topic: function(input) {
    //SHOW THE TOPIC, AT THE TOP OF ITS ORIGIN
  }

  
});
