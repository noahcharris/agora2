$.ajax({
  url: 'http://localhost:80' + urlPath,
  crossDomain: true,
  data: {
    location: location,
    channel: that.get('channel')
  },
  success: function(data) {
    if (data) {
      topicsCollection = data;
      console.log('server returned: ', data);
      //HAVE TO REMEMBER TO DO THIS EVERYTIME OR ELSE CHANGE SIDEBARVIEW'S
      sidebarView.collection = data;
      content1.show(sidebarView); 
    } else {
      console.log('memcached returned false');
      sidebarView.collection = defaultCollection;
      content1.show(sidebarView);
    }
  }, error: function(err) {
    console.log('ajax error ocurred: ', err);
  }

});

