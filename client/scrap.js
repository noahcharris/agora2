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





var greenIcon = L.icon({
    iconUrl: 'leaf-green.png',
    shadowUrl: 'leaf-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});




xhrFields: {
  withCredentials: true
},





//IMAGE OVERLAY
(function() {
  var on = false;
  that.$el.children('#profileColumnWrapper').children('#profilePicture')[0].onclick = function(e) {
    e.stopPropagation();
    if (!on) {
      on = true;
      var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image + suffix +'"></img></div>')
      $overlayImage.on('click', function() {
        $(this).fadeOut(333, function() {
          $(this).remove();
          on = false;
        });
      });
      $('#mainWrapper').append($overlayImage);
      $overlayImage.hide();
      $overlayImage.fadeIn(333);
    }
  };
})();


this.router.navigate('World#'+this.app.get('channel'), { trigger:false });




    if (location.split('/').length === 2) {
      //COUNTRY
    


    } else if (location.split('/').length === 3 && location.split('/')[1] === 'United States') {
      //PROVINCE
      //TODO



    } else {
      //CITY




    }





//HIDING OFFSCREEN MARKERS

var myMarkers = [... this is an array of all the L.Marker for your data... ];

map.on('moveend', placeMarkersInBounds);

placeMarkersInBounds();

function placeMarkersInBounds() {
    var mapBounds = map.getBounds();
    for (var i = myMarkers.length -1; i >= 0; i--) {
        var m = myMarkers[i];
        var shouldBeVisible = mapBounds.contains(m.getLatLng());
        if (m._icon && !shouldBeVisible) {
            map.removeLayer(m);
        } else if (!m._icon && shouldBeVisible) {
            map.addLayer(m);
        }
    }
}














