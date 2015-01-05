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
        that.addPointsWithinRadius(center.lat, center.lng);
      } else {
        that.removePoints();
      }
    });

  },//end initialization


  logBounds: function() {
    console.log(this.get('map').getBounds());
  },

  setZoomEvents: function() {
    var that = this;
    this.get('map').on('moveend', function() {
      zoomDestination = that.get('map').getZoom();
      if (zoomDestination > 3) {
        if (!that.get('citiesOn'))
          that.addCities();
      };
      if (zoomDestination > 3 && zoomDestination < 8) {
        if (!that.get('statesOn'))
          that.addStates();
      };
      if (zoomDestination < 4) {
        if (that.get('citiesOn'))
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


    if (!this.placing) {
      this.app.get('content2').hide();
      //remember to switch this to the new system
      this.app.trigger('reloadSidebarTopics', 'World');
    }
  },



  showHeatPoint: function(location, occurrences) {

    console.log(location, occurrences);


    var greenIcon = L.icon({
        iconUrl: '/resources/images/leaf-green.png',
        shadowUrl: '/resources/images/leaf-shadow.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
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

      console.log(countries);

      var countryName = location;
      for (var key in countries._layers) {
        if (countries._layers[key].feature.properties.name === countryName) {
          console.log('HEATPOINT AT: ', countries._layers[key].getBounds().getCenter());
          var circle = L.marker(countries._layers[key].getBounds().getCenter(),
          {icon: greenIcon}).addTo(this.get('map'));
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
      console.log(states);
      var stateName = location;
      for (var key in states._layers) {
        if (states._layers[key].feature.properties.name === stateName) {
          console.log('HEATPOINT AT: ', states._layers[key].getBounds().getCenter());
          var circle = L.marker(states._layers[key].getBounds().getCenter(),
          {icon: greenIcon}).addTo(this.get('map'));
        }
      }

    } else {
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
          console.log('HEATPOINT AT: ', cities._layers[key]._latlng);
          var circle = L.marker(cities._layers[key]._latlng,
          {icon: greenIcon}).addTo(this.get('map'));
        }
      }


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
              weight: 0,
              //color: '#666',
              dashArray: '',
              opacity: 1,
              fillOpacity: 0.3
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
                // weight: 5,
                // color: '#666',
                // dashArray: '',
                // fillOpacity: 0.8
                weight: 0,
                //color: '#666',
                dashArray: '',
                opacity: 1,
                fillOpacity: 0.3
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
                color: '#666',
                dashArray: '',
                fillOpacity: 0.8
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
    var cities = this.get('cities') || {};
    for (var key in cities._layers) {
      // if (cities._layers[key].city === cityName) {
      //   cities._layers[key].setStyle({
      //           weight: 5,
      //           color: '#666',
      //           dashArray: '',
      //           fillOpacity: 0.8
      //       });
      // }
    }
  },
  removeHighlightCity: function(cityName) {
    var cities = this.get('cities') || {};
    for (var key in cities._layers) {
      // if (cities._layers[key].city === cityName) {
      //   cities.resetStyle(cities._layers[key]);
      // }
    }
  },
  hightlightPlace: function(placeName) {
    var places = this.get('places') || {};
    for (var key in places._layers) {
      // if (places._layers[key].city === placeName) {
      //   places._layers[key].setStyle({
      //           weight: 5,
      //           color: '#666',
      //           dashArray: '',
      //           fillOpacity: 0.8
      //       });
      // }
    }
  },
  removeHighlightPlace: function(placeName) {
    var places = this.get('places') || {};
    for (var key in places._layers) {
      if (places._layers[key].feature.properties.name === placeName) {
        places.resetStyle(places._layers[key]);
      }
    }
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
      this.showWorld();
    }


    //COUNTRY
    if (path.split('/').length === 2) {

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
    } else {

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
    this.placing = true;
    var markerLayer = L.layerGroup();
    this.handler = function(e) {
      that.placedLatitude = e.latlng.lat;
      that.placedLongitude = e.latlng.lng;
      markerLayer.clearLayers();
      markerLayer.addLayer(L.marker(e.latlng));
      markerLayer.addTo(that.get('map'));
    };
    this.get('map').on('click', this.handler);
  },

  stopPlacing: function() {
    //this.get('map').off('click.placingPoints');
    this.get('map').off('click', this.handler);
    this.placing = false;
    //remove the click handler
  },

  




  

  //###################################
  // ## ADDING AND REMOVING FEATURES ##
  //###################################

  addPointsWithinRadius: function(latitude, longitude) {

    var that = this;

    $.ajax({
      url: 'points',
      method: 'GET',
      data: { latitude: latitude, longitude: longitude },
      success: function(data) {
        that.pointsLayer.clearLayers();
        for (var i=0;i<data.length;i++) {
          //apparently longitude comes first when instantiating a marker?
          var what = data[i];
          var marker = L.marker([data[i].latitude, data[i].longitude], {
            title: 'marker'
          });
          marker.on('click', function(e) {

            // ### GOING TO GROUP WHEN YOU CLICK THE MARKER ###

            console.log('hello');
            console.log(e);
            that.get('map').setView(e.latlng);
            that.set('location', what.location);
            //will this variable name be renamed?
            that.set('group', what.name);
            that.app.get('sidebarView').displayed = 'GroupTopics';
            that.trigger('reloadGroupSidebar', {
              location: what.location,
              group: what.name
            });



            //probably need to change locationView, reloadSidebar, and firbounds to the point,
            //don't go through goToPath, it will not center on the marker


            // ###################################
          });
          that.pointsLayer.addLayer(marker);
          that.pointsLayer.addTo(that.get('map'));
        }

      }
    });
    //AJAX call to the server, get back the cities,
    //if location is still equal to the path when the response comes,
    //load them
  },

  removePoints: function() {
    this.pointsLayer.clearLayers();
  },


  addCities: function() {




    var greenIcon = L.icon({
        iconUrl: '/resources/images/leaf-green.png',
        shadowUrl: '/resources/images/leaf-shadow.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });


    //L.marker([51.5, -0.09], {icon: greenIcon}).addTo(this.get('map'));





    var that = this;
    if (!this.get('cities')) {  //always use this if/else to avoid initializing the polygons more than once
      var citiesLayer = L.layerGroup();
      for (var i=0;i<cities.features.length;i++) {
        var circle = L.circle(L.GeoJSON.coordsToLatLng(cities.features[i].geometry.coordinates), 10000, {
          color:'#fa9e25',
          fillOpacity: 0.2,
          opacity: 0.5
        });

        // var circle = L.marker(L.GeoJSON.coordsToLatLng(cities.features[i].geometry.coordinates),
        //  {icon: greenIcon}).addTo(this.get('map'));
        
        circle.city = cities.features[i].properties.city;
        circle.on('click', function(e) {
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
        });
        circle.on('mouseover', function(e) {
          console.log('city: ',e);
          var data = {
            name: e.target.city
          }
          that.showMapPopup(data);
        });
        circle.on('mouseout', function(e) {
          that.closeMapPopup();
        });
        citiesLayer.addLayer(circle);
      }
      citiesLayer.addTo(this.get('map'));
      this.set('cities', citiesLayer);
      this.set('citiesOn', true);
    } else {
      this.get('map').addLayer(this.get('cities'));
      this.set('citiesOn', true);
    }
  },

  removeCities: function() {
    this.get('map').removeLayer(this.get('cities'));
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
        console.log(e);
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
    this.get('map').removeLayer(this.get('countries'));
    this.set('countriesOn', false);
  }

});
