window.Agora = window.Agora || {};
window.Agora.Controllers = window.Agora.Controllers || {};

Agora.Controllers.MapController = Backbone.Model.extend({


  //MAP CONTROLLER NEEDS TO HAVE GROUPS REMOVED


  defaults: {
    location: 'World',
    //need to exorcise 'groups'
    group:'',
    countries: null,
    states: null,
    cities: null,
    places: null
  },

  initialize: function(appController) {
    var that = this;

    this.router = null;
    this.app = appController;
    this.handler;
    //use this for point placement to disable reloading sidebar
    this.placing = false;
    this.placedLatitude;
    this.placedLongitude;
    //this holds the user-created points currently loaded on the map
    this.pointsLayer = L.layerGroup();

    //for placing points
    this.markerLayer = null;

    //for topic hover highlighting
    this.cityMarker = null;
    this.placeMarker = null;

    var southWest = L.latLng(-90, -300);
    var northEast = L.latLng(90, 300);
    var bounds = L.latLngBounds(southWest, northEast);

    var map = L.map('map', {
      maxZoom: 18,  //tiles don't seem to load correctly when set to 19, which seems ideal for a maxZoom
      minZoom: 2,
      worldCopyJump: true,    //looks like it's a little buggy around the copy point??
      maxBounds: bounds,
      inertia: false           //the leaflet inertia screws with the ^ worldCopyJump, so set it to false
    }).setView([21.28937435586041, 4.21875], 2);

    L.tileLayer('http://api.tiles.mapbox.com/v3/noahcharris.gdajdeem/{z}/{x}/{y}.png32', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    this.set('map', map);
    this.addCountries(); //map starts off with countries loaded
    this.setZoomEvents();


    //CLUSTER GROUP

    // var clusterGroup = new L.MarkerClusterGroup({
    //   disableClusteringAtZoom: 8
    // });
    // //use addLayers instead
    // clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    // clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    // clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    // map.addLayer(clusterGroup);




    //HEATPOINTSSSSSS 
    //∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆

    $.ajax({
      url: 'http://liveworld.io:80/heatPoints',
      crossDomain: true,
      data: {
        location: this.get('location'),
        channel: this.app.get('channel')
      },
      success: function(data) {
        if (data) {

          //RECEIVE TOP 100 TOPICS FOR HEAT,
          //BUILD A TOP 10 OBJECT OF DISTINCT AREAS,
          //EXCLUDING WORLD, COMBINED W/ # OF OCCURRENCES
          var result = {};
          var count = 0;
          for (var i=0; i < data.length ;i++) {
            if (data[i].location === 'World')
              continue;
            if (count > 9)
              break;
            if (Object.keys(result).indexOf(data[i].location) === -1) {
              result[data[i].location] = 1;
              count++;
            } else {
              result[data[i].location] = result[data[i].location] + 1;
            }
          }

          console.log("RESULT: ", result);

          for (var key in result) {

            //TODO - GIVE THE CORRESPONDING LOCATION A 
            //DOPE LITTLE ICON, WHICH INCREASES IN INTENSITY
            //AS THERE ARE MORE OCCURRENCES WITHIN THE 
            //TOP 10 OBJECT
            that.showHeatPoint(key, result[key]);

          }
          
          console.log('server returned fadsJKFLD:SJL:JF: ', data);
        } else {
        }
      }, error: function(err) {
        console.log('ajax error ocurred: ', err);
      }

    });






    //SYSTEM FOR HANDLING CUSTOM COUNTRY ZOOM BOUNDS

    var southWest = L.latLng(15.284185114076445, -107.025390625);
    var northEast = L.latLng(56.17002298293205, -90.23046875);
    var usBounds = L.latLngBounds(southWest, northEast);
    this.usBounds = usBounds;

    southWest = L.latLng(33.87041555094183, -97.119140625);
    northEast = L.latLng(66.01801815922042, -69.169921875);
    var canadaBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(37.16031654673677, 26.015625);
    northEast = L.latLng(67.60922060496382, 58.17187499999999);
    var russiaBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(57.136239319177434, -10.1953125);
    northEast = L.latLng(68.9110048456202, 31.552734374999996);
    var norwayBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(54.87660665410869, -3.4716796874999996);
    northEast = L.latLng(67.40748724648753, 38.2763671875);
    var swedenBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(7.798078531355303, 61.04003906249999);
    northEast = L.latLng(32.32427558887655, 102.7880859375);
    var indiaBounds = L.latLngBounds(southWest, northEast);


    this.customBounds = [{
      name: 'World/Russia',
      bounds: russiaBounds
    }, {
      name: 'World/Norway',
      bounds: norwayBounds
    }, {
      name: 'World/United States',
      bounds: usBounds
    }, {
      name: 'World/Canada',
      bounds: canadaBounds
    }, {
      name: 'World/Sweden',
      bounds: swedenBounds
    }, {
      name: 'World/India',
      bounds: indiaBounds
    }, ];


    //LAZY POINT LOADING
    map.on('moveend', function() {
      if (map.getZoom() > 7) {
        center = map.getCenter();
        console.log(center);
        that.addPlacesWithinRadius(center.lat, center.lng);
      } else {
        that.removePlaces();
      }
    });

  },//end initialization


  logBounds: function() {
    console.log(this.get('map').getBounds());
  },

  setZoomEvents: function() {
    var that = this;
    this.get('map').on('moveend', function() {

      if (!that.placing) {

        zoomDestination = that.get('map').getZoom();
        if (zoomDestination > 3) {
          // if (!that.get('citiesOn'))
            that.removeCities();
            that.addCities();
        };
        if (zoomDestination > 3 && zoomDestination < 8) {
          if (!that.get('statesOn'))
            that.addStates();
        };
        if (zoomDestination < 4) {
          // if (that.get('citiesOn'))
            that.removeCities();
        };
        if (zoomDestination < 4) {
          if (that.get('statesOn'))
            that.removeStates();
        };
        if (zoomDestination < 8) {
          if (!that.get('countriesOn'))
            that.addCountries();
        };
        if (zoomDestination > 7) {
          if (that.get('countriesOn'))
            that.removeCountries();
          if (that.get('statesOn'))
            that.removeStates();
        };
        //Make sure the countries are always in the back. They are also brought to back in the adding functions.
        if (that.get('statesOn') && that.get('countriesOn'))
          that.get('countries').bringToBack();

      }

    });
  },









  showWorld: function() {
    var southWest = L.latLng(-67.474922384787, -153.984375);
    var northEast = L.latLng(79.36770077764092, 162.421875);
    var worldBounds = L.latLngBounds(southWest, northEast);

    // !! to break out of anything that's not topics or groups mode
    if (this.app.get('sidebarView').displayed !== 'Topics-Top'
      && this.app.get('sidebarView').displayed !== 'Topics-New'
      && this.app.get('sidebarView').displayed !== 'Topics-Hot') {
      this.app.get('sidebarView').displayed = 'Topics-Top';
    }

    this.get('map').fitBounds(worldBounds);
    this.set('location', 'World');   //location is set to '' for world, which is automatically added by locationview

    this.router.navigate('World#'+this.app.get('channel'), { trigger:false });

    this.app.get('content2').hide();
    this.app.trigger('reloadSidebarTopics', 'World');

  },




  //NEED TO CHANGE THIS WHEN I ADD IN THE USER-PLACES

  showHeatPoint: function(location, occurrences) {
    var that = this;



    console.log('SETTING HEAT POINT WITH LOCATION: ', location);

    var greenIcon = L.icon({
        iconUrl: '/resources/images/logo.png',
        shadowUrl: '/resources/images/logo.png',

        iconSize:     [20, 26], // size of the icon
        shadowSize:   [0, 0], // size of the shadow
        iconAnchor:   [4.5, 26], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    //TODO - determine whether it is a country, province, or city,
    //take appropriate action to paint a DOPE icon on the map

    //change the intensity of the icon as occurrences increases
    if (location.split('/').length === 2) {
      //COUNTRY
      //put it at the center of the bounds
      if (!this.get('countries')) {  //DON'T DO THIS PLEASE!!!!!!
        this.addCountries();
        this.removeCountries();
      }
      var countries = this.get('countries') || {};

      var countryName = location;
      for (var key in countries._layers) {
        if (countries._layers[key].feature.properties.name === countryName) {

          countries._layers[key].setStyle({
                  fillColor: '#ff0000',
                  weight: 2,
                  dashArray: '',
                  opacity: 0.0,
                  fillOpacity: 0.5
              });

        }
      }



    } else if (location.split('/').length === 3 && location.split('/')[1] === 'United States') {
      //PROVINCE
      //TODO
      if (!this.get('states')) {  //DON'T DO THIS PLEASE!!!!!!
        this.addStates();
        this.removeStates();
      }
      var states = this.get('states') || {};
      //put it at the center of the bounds
      var stateName = location;
      for (var key in states._layers) {
        if (states._layers[key].feature.properties.name === stateName) {
          states._layers[key].setStyle({
                  fillColor: '#ff0000',
                  weight: 2,
                  dashArray: '',
                  opacity: 0.0,
                  fillOpacity: 0.5
              });
        }
      }

    } else if (location.split('/').length === 3 || (location.split('/').length === 4 && location.split('/')[1] === 'United States')) {
      //CITY
      if (!this.get('cities')) {  //DON'T DO THIS PLEASE!!!!!!
        this.addCities();
        this.removeCities();
      }
      var cities = this.get('cities') || {};
      var cityName = location;
      console.log(cities);
      //put it at the coordinates of the city
      for (var key in cities._layers) {
        if (cities._layers[key].city === cityName) {
          var circle = L.marker(cities._layers[key]._latlng,
          {icon: greenIcon}).addTo(this.get('map'));
          circle.on('click', function(e) {
            that.goToPath(location);
          });
        }
      }


    } else {
      //USER-CREATED PLACE

      console.log("USER AREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAv")

      $.ajax({
        url: 'http://liveworld.io:80/placeLatLng',
        crossDomain: true,
        method: 'GET',
        data: {
          name: location
        },
        success: function(data) {
          if (data) {
            var coords = L.latLng(data[0].latitude, data[0].longitude);

            console.log("WJOEJEWJFWO COOOORDINATES::: ", coords);
            var circle = L.marker(coords,
            {icon: greenIcon}).addTo(that.get('map'));
            circle.on('click', function(e) {
              that.goToPath(location);
            });
          } else {
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });





    }



  },




  //LATER ON ADD A hightlightCountries function that does many at a time more efficiently

  highlightWorld: function() {
    var countries = this.get('countries') || {};
    for (var key in countries._layers) {


      countries._layers[key].setStyle({
              // weight: 5,
              // color: '#666',
              // dashArray: '',
              // fillOpacity: 0.8
              //color: '#000000',
              weight: 2,
              //color: '#666',
              dashArray: '',
              opacity: 1,
              fillOpacity: 0.0
          });


    }



  },

  removeHighlightWorld: function() {
    var countries = this.get('countries') || {};
    for (var key in countries._layers) {

      countries.resetStyle(countries._layers[key]);

    }

  },

  highlightCountry: function(countryName) {
    var countries = this.get('countries') || {};
    for (var key in countries._layers) {
      if (countries._layers[key].feature.properties.name === countryName) {
        countries._layers[key].setStyle({
                //color: '#000000',
                weight: 2,
                //color: '#666',
                dashArray: '',
                opacity: 1,
                fillOpacity: 0.0
            });
      }
    }
  },
  removeHighlightCountry: function(countryName) {
    var countries = this.get('countries') || {};
    for (var key in countries._layers) {
      if (countries._layers[key].feature.properties.name === countryName) {
        countries.resetStyle(countries._layers[key]);
      }
    }
  },
  highlightState: function(stateName) {
    var states = this.get('states') || {};
    for (var key in states._layers) {
      if (states._layers[key].feature.properties.name === stateName) {
        states._layers[key].setStyle({
                weight: 5,
                //color: '#000000',
                // color: '#666',
                dashArray: '',
                opacity: 1,
                fillOpacity: 0.0
            });
      }
    }
  },
  removeHighlightState: function(stateName) {
    var states = this.get('states') || {};
    for (var key in states._layers) {
      if (states._layers[key].feature.properties.name === stateName) {
        states.resetStyle(states._layers[key]);
      }
    }
  },
  highlightCity: function(cityName) {

    console.log('trying to highlight: ', cityName);

    var cities = this.get('cities') || {};
    for (var key in cities._layers) {
      if (cities._layers[key].city === cityName) {

        var cityIcon = L.icon({
            iconUrl: '/resources/images/dot.png',
            shadowUrl: '/resources/images/leaf-shadow.png',

            iconSize:     [30, 15], // size of the icon
            shadowSize:   [0, 0], // size of the shadow
            iconAnchor:   [15, 7.5], // point of the icon which will correspond to marker's location
            shadowAnchor: [0, 0],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });


        this.cityMarker = L.layerGroup();
        var marker = L.marker(cities._layers[key]._latlng, {icon: cityIcon});
        this.cityMarker.addLayer(marker);
        this.cityMarker.addTo(this.get('map'));

      }
    }
  },
  removeHighlightCity: function(cityName) {
    var cities = this.get('cities') || {};
    if (this.cityMarker)
      this.get('map').removeLayer(this.cityMarker);

  },
  //need to pass in lat and long because we don't store it like the others
  highlightPlace: function(placeName, latitude, longitude) {
    var placeIcon = L.icon({
        iconUrl: '/resources/images/dot.png',
        shadowUrl: '/resources/images/leaf-shadow.png',

        iconSize:     [30, 15], // size of the icon
        shadowSize:   [0, 0], // size of the shadow
        iconAnchor:   [15, 7.5], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    console.log('highlishting place: ', latitude, longitude);
    if (this.placeMarker)
      this.get('map').removeLayer(this.placeMarker);
    this.placeMarker = L.layerGroup();
    var marker = L.marker([latitude, longitude], {icon: placeIcon});
    this.placeMarker.addLayer(marker);
    this.placeMarker.addTo(this.get('map'));
  },
  removeHighlightPlace: function(placeName) {
    if (this.placeMarker)
      this.get('map').removeLayer(this.placeMarker);
  },


  closeMapPopup: function() {

    $('#mapPopup').remove();

  },


  showMapPopup: function(data) {

    //data will store info for the popup, as well as mouse X and Y 

    //TODO - determine whether the cursor is on the right
    //or left side of the map. Then load the data into the correct
    //one and display it
    $('#mapPopup').remove();
    $('#map').append($('<div id="mapPopup">'+data.name+'</div>'));



  },









  //THIS SHOULD BE RENAMED 'goToLocation' !!!!!!!!!
  //∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆

  //extra is for 'recently visited' and 'search'
  goToPath: function(path, extra) {


    console.log('goingt to path', path);

    var that = this;




    this.app.get('sidebarView').displayed = 'Topics-Top';

    if (path.split('/').length === 1) {
      //WORLD
      this.showWorld();
    } else if (path.split('/').length === 2) {
      //COUNTRY

      var name = path

      var foo = false;
      for (var i=0;i<that.customBounds.length;i++) {
        if (name === that.customBounds[i].name) {
          that.get('map').fitBounds(that.customBounds[i].bounds);
          this.set('location', path);
          foo = true;
          break;
        }
      }

      if (!foo) {
        
        for (var key in this.get('countries')._layers) {
          if (this.get('countries')._layers[key].feature.properties.name === path) {
            this.get('map').fitBounds(this.get('countries')._layers[key].getBounds());
            this.set('location', path);
          }
        }
      }

      
    //need to refactor the custom bounds to the top of this file and use them here

    //IF IT'S A COUNTRY WITH STATES (ONLY THE US RIGHT NOW)
    var map = this.get('map');
    } else if (path.split('/').length === 3 && path.split('/')[1] === 'United States') {
      //super hacky way to still use goToPath if the states haven't been created yet, maybe just create on initialize then???
      if (!this.get('states')) {  //DON'T DO THIS PLEASE!!!!!!
        this.addStates();
        this.removeStates();
      }
      for (var key in this.get('states')._layers) {
        if (this.get('states')._layers[key].feature.properties.name === path) {
          this.get('map').fitBounds(this.get('states')._layers[key].getBounds());
          this.set('location', path);
        }
      }

    //IF IT'S A CITY
    } else if (path.split('/').length === 3 || (path.split('/').length === 4 && path.split('/')[1] === 'United States')) {

      if (!this.get('cities')) {  //DON'T DO THIS PLEASE!!!!!!
        this.addCities();
        this.removeCities();
      }
      for (var key in this.get('cities')._layers) {
        if (this.get('cities')._layers[key].city === path) {
          this.get('map').setZoom(12);
          this.get('map').panTo(this.get('cities')._layers[key]._latlng);
          this.set('location', path);
        }
      }
    } else {
      //USE-GENERATED PLACE

      console.log('eklwrjlkejrklwaj');
      //MAKE AN AJAX CALL TO GET LAT AND LNG OF THE PLACE
      $.ajax({
        url: 'http://liveworld.io:80/placeLatLng',
        crossDomain: true,
        method: 'GET',
        data: {
          name: path
        },
        success: function(data) {
          if (data) {
            that.get('map').setZoom(12);
            console.log('wjeklajk: ', data[0].latitude, data[0].longitude);
            var coords = L.latLng(data[0].latitude, data[0].longitude);
            that.get('map').panTo(coords);
            that.set('location', path);
            that.app.trigger('reloadSidebarTopics', path);
          } else {
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });





    }

    if (!this.placing) {
      if (this.app.get('sidebarView').displayed !== 'Topics'
      && this.app.get('sidebarView').displayed !== 'Topics-Top'
      && this.app.get('sidebarView').displayed !== 'Topics-New'
      && this.app.get('sidebarView').displayed !== 'Topics-Hot') {
        this.app.get('sidebarView').displayed = 'Topics-Top';
      }
      this.app.get('content2').hide();
      this.app.trigger('reloadSidebarTopics', path, extra);
    }

  },










  //why isn't this stopping sidebar from reloading anymore??

  // ## PLACING POINTS ##

  placePoints: function() {
    var that = this;
    this.removeCountries();
    this.removeStates();
    this.removeCities();
    //remove all map features

    this.markerLayer = L.layerGroup();

    this.handler = function(e) {
      that.placedLatitude = e.latlng.lat;
      that.placedLongitude = e.latlng.lng;
      that.markerLayer.clearLayers();
      that.markerLayer.addLayer(L.marker(e.latlng));
      that.markerLayer.addTo(that.get('map'));
    };
    this.get('map').on('click', this.handler);
  },

  stopPlacing: function() {
    this.get('map').off('click', this.handler);
    this.markerLayer.clearLayers();
  },

  




  

  //###################################
  // ## ADDING AND REMOVING FEATURES ##
  //###################################

  addPlacesWithinRadius: function(latitude, longitude) {


    var that = this;

    $.ajax({
      //this is not for 'placing' points, it is retrieving points of 'Places'
      url: 'http://liveworld.io:80/placePoints',
      method: 'GET',
      data: { 
        latitude: latitude,
        longitude: longitude
      },
      success: function(data) {

        console.log('POINTSSZZZZZ::::: ', data);
        that.pointsLayer.clearLayers();

        if (data.length) {


          //CHECK TO SEE WHAT ZOOM LEVEL WE ARE AT AND PUT DOWN EITHER CIRCLES OR ICONS DEPENDING

          var placeIcon = L.icon({
              iconUrl: '/resources/images/house.png',
              shadowUrl: '/resources/images/leaf-shadow.png',

              iconSize:     [17, 20], // size of the icon
              shadowSize:   [0, 0], // size of the shadow
              iconAnchor:   [8.5, 19], // point of the icon which will correspond to marker's location
              shadowAnchor: [4, 62],  // the same for the shadow
              popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          });

          for (var i=0;i<data.length;i++) {

            var latlng = L.latLng(data[i].latitude, data[i].longitude);

            if (that.get('map').getZoom() < 12) {

              var marker = L.circle(latlng, 250, {
                color:'#0066FF',
                fillOpacity: 0.7,
                opacity: 0.5
              });

            } else {
              var marker = L.marker(latlng, {icon: placeIcon});
            }

            (function() { 
              var temp = data[i].name;
              var temp2 = latlng;
              marker.on('click', function(e) {
                that.get('map').setView(e.latlng);
                that.get('map').setZoom(14);
                L.Util.requestAnimFrame(that.get('map').invalidateSize, that.get('map'), false, that.get('map')._container)
                that.set('location', temp);
                that.app.trigger('reloadSidebarTopics', temp);
              });




              
            })();


            that.pointsLayer.addLayer(marker);
            that.pointsLayer.addTo(that.get('map'));
          }

        }
          
      }
    });
    //AJAX call to the server, get back the cities,
    //if location is still equal to the path when the response comes,
    //load them
  },

  removePlaces: function() {
    this.pointsLayer.clearLayers();
  },



  addCities: function() {




    var cityIcon = L.icon({
        iconUrl: '/resources/images/city.png',
        shadowUrl: '/resources/images/leaf-shadow.png',

        iconSize:     [32, 40], // size of the icon
        shadowSize:   [0, 0], // size of the shadow
        iconAnchor:   [8, 17], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    //L.marker([51.5, -0.09], {icon: greenIcon}).addTo(this.get('map'));

    var that = this;
    if (!this.get('cities')) {  //always use this if/else to avoid initializing the polygons more than once
      var citiesLayer = L.layerGroup();
      var citiesIconLayer = L.layerGroup();
      for (var i=0;i<cities.features.length;i++) {

        //CREATE TWO LAYER GROUPS AND CALL ONE OR THE OTHER DEPENDING
        var circle = L.circle(L.GeoJSON.coordsToLatLng(cities.features[i].geometry.coordinates), 10000, {
          color:'#fa9e25',
          fillOpacity: 0.7,
          opacity: 0.5
        });

        var icon = L.marker(L.GeoJSON.coordsToLatLng(cities.features[i].geometry.coordinates),
         {icon: cityIcon});//.addTo(this.get('map')); 

        var clickHandler = function(e) {
          that.get('map').setZoom(12, { animate:false });
          that.get('map').panTo(e.target._latlng, { animate:false });
          that.set('location', e.target.city);
          //that.router.navigate('World/'+e.target.city, { trigger:false });
          if (!that.placing) {
            if (that.app.get('sidebarView').displayed !== 'Topics'
              && that.app.get('sidebarView').displayed !== 'Topics-Top'
              && that.app.get('sidebarView').displayed !== 'Topics-New'
              && that.app.get('sidebarView').displayed !== 'Topics-Hot') {
                that.app.get('sidebarView').displayed = 'Topics-Top';
              } 
            that.set('group', undefined);
            that.app.trigger('reloadSidebarTopics', e.target.city);
          }
        };
        var mouseoverHandler = function(e) {
          var data = {
            name: e.target.city
          }
          that.showMapPopup(data);
        };
        var mouseoutHandler = function(e) {
          that.closeMapPopup();
        };

        
        circle.city = cities.features[i].properties.city;
        icon.city = cities.features[i].properties.city;

        circle.on('click', clickHandler);
        icon.on('click', clickHandler);

        circle.on('mouseover', mouseoverHandler);
        icon.on('mouseover', mouseoverHandler);

        circle.on('mouseout', mouseoutHandler);
        circle.on('mouseout', mouseoutHandler);
        citiesLayer.addLayer(circle);
        citiesIconLayer.addLayer(icon);
      }

      if (that.get('map').getZoom() < 9) {      
        citiesLayer.addTo(this.get('map'));
      } else {
        citiesIconLayer.addTo(this.get('map'));
      }
      this.set('cities', citiesLayer);
      this.set('cityIcons', citiesIconLayer);
      this.set('citiesOn', true);
    } else {
      if (that.get('map').getZoom() < 9) {      
        this.get('map').addLayer(this.get('cities'));
      } else {
        this.get('map').addLayer(this.get('cityIcons'));
      }
      this.set('citiesOn', true);
    }
  },

  removeCities: function() {
    if (this.get('cities')) {    
      this.get('map').removeLayer(this.get('cities'));
      this.get('map').removeLayer(this.get('cityIcons'));
    }
    this.set('citiesOn', false);
  },



  // STATES

  addStates: function() {
    if (!this.get('states')) {
      var statesLayer;
      var that = this;

      function getColor(d) {
        // return d > 1000 ? '#800026' :
        //        d > 500  ? '#BD0026' :
        //        d > 200  ? '#E31A1C' :
        //        d > 100  ? '#FC4E2A' :
        //        d > 50   ? '#FD8D3C' :
        //        d > 20   ? '#FEB24C' :
        //        d > 10   ? '#FED976' :
                        return '#FFEDA0';
      }
  
      function style(feature) {     //probably split these functions out for use in other mapController operations
        return {
            fillColor: getColor(feature.properties.density),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.3
        };
      }
  
      function mouseover(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
        });

        var data = {
          name: e.target.feature.properties.name
        }
        that.showMapPopup(data);
      };
  
      function mouseout(e) {
        statesLayer.resetStyle(e.target);
        that.closeMapPopup();
      };
  
      //this has been altered to deal with new country data with /'s
      function clickFeature(e) {
        that.get('map').fitBounds(e.target.getBounds());
        if (!that.placing) {
          that.app.get('content2').hide();


          if (that.app.get('sidebarView').displayed !== 'Topics'
            && that.app.get('sidebarView').displayed !== 'Topics-Top'
            && that.app.get('sidebarView').displayed !== 'Topics-New'
            && that.app.get('sidebarView').displayed !== 'Topics-Hot') {
              that.app.get('sidebarView').displayed = 'Topics-Top';
            }
          that.set('group', undefined);


          that.app.trigger('reloadSidebarTopics', e.target.feature.properties.name);
        }
        that.set('location', e.target.feature.properties.name);
        //that.router.navigate('World/'+e.target.feature.properties.name, { trigger:false });
      };
  
      function onEachFeature(feature, layer) {
        layer.on({
            mouseover: mouseover,
            mouseout: mouseout,
            click: clickFeature
        });
      }
      statesLayer = L.geoJson(statesData, { onEachFeature: onEachFeature, style: style }).addTo(this.get('map'));
      this.set('states', statesLayer);
      this.get('states').bringToBack(); //remember to bring states and countries to back.. in that order
      this.set('statesOn', true);
    } else {
      this.get('states').addTo(this.get('map'));
      this.get('states').bringToBack();
      this.set('statesOn', true);
    }
  },

  removeStates: function() {
    if (this.get('states'))
      this.get('map').removeLayer(this.get('states'));
    this.set('statesOn', false);
  },





  // COUNTRIES

  addCountries: function() {
    if (!this.get('countries')) {
  
      var countriesLayer;
      var that = this;
  
      function getColor(d) {
        return d > 1000 ? '#800026' :
               d > 500  ? '#BD0026' :
               d > 200  ? '#E31A1C' :
               d > 100  ? '#FC4E2A' :
               d > 50   ? '#FD8D3C' :
               d > 20   ? '#FEB24C' :
               d > 10   ? '#FED976' :
                          '#58e35c';
      }
  
      function style(feature) {
        return {
            fillColor: getColor(feature.properties.density),
            weight: 0,
            color: 'white',
            dashArray: '',
            opacity: 1,
            fillOpacity: 0.0
        };
      }


      function mouseover(e) {
        var layer = e.target;

        //put the mouseover code in here for now
        //var x = e.originalEvent.pageX - that.app.get('sidebarView').$el.width();
        var data = {
          name: e.target.feature.properties.name
        }
        that.showMapPopup(data);

        layer.setStyle({
            weight: 0,
            //color: '#666',
            dashArray: '',
            opacity: 1,
            fillOpacity: 0.3
        });
      };
      function mouseout(e) {
        countriesLayer.resetStyle(e.target);
        that.closeMapPopup();
      };



      function clickFeature(e) {
        var name = e.target.feature.properties.name;

        var foo = false;
        for (var i=0;i<that.customBounds.length;i++) {
          if (name === that.customBounds[i].name) {
            console.log('for ', name, ' custom bounds: ', that.customBounds[i]);
            that.get('map').fitBounds(that.customBounds[i].bounds);
            foo = true;
            break;
          }
        }

        if (!foo) {
          that.get('map').fitBounds(e.target.getBounds());
        }

        if (!that.placing) {
          that.app.get('content2').hide();


          if (that.app.get('sidebarView').displayed !== 'Topics'
            && that.app.get('sidebarView').displayed !== 'Topics-Top'
            && that.app.get('sidebarView').displayed !== 'Topics-New'
            && that.app.get('sidebarView').displayed !== 'Topics-Hot') {
              that.app.get('sidebarView').displayed = 'Topics-Top';
            }
          that.set('group', undefined);

        }
        that.app.trigger('reloadSidebarTopics', name);
        that.set('location', name);
        //that.router.navigate('World/'+e.target.feature.properties.name, { trigger:false });
      };
      function onEachFeature(feature, layer) {
        layer.on({
            mouseover: mouseover,
            mouseout: mouseout,
            click: clickFeature
        });
      }
      countriesLayer = L.geoJson(countriesData, { onEachFeature: onEachFeature, style: style }).addTo(this.get('map'));
      this.set('countries', countriesLayer);
      this.get('countries').bringToBack();
      this.set('countriesOn', true);

    } else {
      this.get('countries').addTo(this.get('map'));
      this.get('countries').bringToBack();
      this.set('countriesOn', true);
    }
  },

  removeCountries: function() {
    if (this.get('countries'))
      this.get('map').removeLayer(this.get('countries'));
    this.set('countriesOn', false);
  }

});





