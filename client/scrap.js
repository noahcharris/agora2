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




var $saveChangesButton = $('<button>Save Changes</button>');
$saveChangesButton[0].onclick = function() {

};
this.$el.append($saveChangesButton);




//REMEMBER TO USE PREVENT DEFAULT ON THE LINKS WHICH OVER SIDEBAR TOPICS AND SHIT






//uploading images
var fd = new FormData();    
fd.append( 'file', input.files[0] );

$.ajax({
  url: 'http://example.com/script.php',
  data: fd,
  processData: false,
  contentType: false,
  type: 'POST',
  success: function(data){
    alert(data);
  }
});




ANON PICTURE
'http://www.utne.com/~/media/Images/UTR/Editorial/Articles/Magazine%20Articles/2012/11-01/Anonymous%20Hacktivist%20Collective/Anonymous-Seal.jpg'









