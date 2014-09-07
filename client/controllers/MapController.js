window.Agora = window.Agora || {};
window.Agora.Controllers = window.Agora.Controllers || {};

Agora.Controllers.MapController = Backbone.Model.extend({


  //MAP CONTROLLER NEEDS TO HAVE GROUPS REMOVED


  defaults: {
    location: '',
    group:'',
  },

  initialize: function(appController) {

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

    var clusterGroup = new L.MarkerClusterGroup({
      disableClusteringAtZoom: 8
    });
    //use addLayers instead
    clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    clusterGroup.addLayer( new L.Marker([21.28937435586041, 4.21875]));
    map.addLayer(clusterGroup);



    //SYSTEM FOR HANDLING CUSTOM COUNTRY ZOOM BOUNDS

    var southWest = L.latLng(14.008696370634658, -136.40625);
    var northEast = L.latLng(55.429013452407396, -52.91015625);
    var usBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(39.095962936305504, -135.791015625);
    northEast = L.latLng(68.52823492039876, -52.294921875);
    var canadaBounds = L.latLngBounds(southWest, northEast);

    southWest = L.latLng(41.04621681452063, 16.875);
    northEast = L.latLng(69.4421276134176, 100.37109375);
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
      name: 'Russia',
      bounds: russiaBounds
    }, {
      name: 'Norway',
      bounds: norwayBounds
    }, {
      name: 'United States',
      bounds: usBounds
    }, {
      name: 'Canada',
      bounds: canadaBounds
    }, {
      name: 'Sweden',
      bounds: swedenBounds
    }, {
      name: 'India',
      bounds: indiaBounds
    }, ];


    //LAZY POINT LOADING
    var that = this;
    map.on('moveend', function() {
      if (map.getZoom() > 7) {
        center = map.getCenter();
        that.addPointsWithinRadius(center.lat, center.lng);
      } else {
        that.removePoints();
      }
    });
  },


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
    this.set('location', '');   //location is set to '' for world, which is automatically added by pathview
    this.router.navigate('World', { trigger:false });
    if (!this.placing) {
      this.app.get('content2').hide();
      //remember to switch this to the new system
      this.app.trigger('reloadSidebarTopics', '');
    }
  },

















  goToPath: function(path) {

    //GO TO PATH ACCEPTS A STRING WITHOUT THE LEADING 'WORLD/'

    console.log('goingt to path', path);

    var that = this;
    var groupMode = false;

    console.log('trying to go to path: ', path);

    if (path.indexOf('~') !== -1) {
      groupMode = true;

      var group = path.split('~')[1];

      //set path to the location fragment
      path = path.split('~')[0];


      if (group.indexOf('/') !== -1) {
        //try to go to the subgroup

        //need to display in path
        that.app.get('sidebarView').displayed = 'SubgroupTopics';
        that.trigger('reloadSubgroupSidebar', {
          location: path,
          group: group.split('/')[0],
          name: group.split('/')[1]
        });

      } else {
        //check if the group exists and go to it

        //make the call to server, wait for the response, zoom to the 
        //location fragment in the meantime, if the response comes in,
        //load and zoom to the group, if it fails, flash an error message
        $.ajax({
          url: 'group',
          method: 'GET',
          data: {
            location: path,
            group: group
          },
          success: function(data) {
            console.log('querying server to see if this group exists');
            console.log('receiving group data ', data);
            //set group here so path doesn't display nonextant groups
            if (data.length) {

              that.set('group', group);
              //need to change sidebarView.displayed need to shift map 
              //to the place
              that.app.get('sidebarView').displayed = 'GroupTopics';
              //this takes in location and group data
              that.trigger('reloadGroupSidebar', { location: path, group: group} );
              // that.app.get('content2').hide();
              // that.app.get('content1').show(that.app.get('sidebarView'));
              // console.log('tried to change it?');
            }
          }
        });

      }

    };

    //IF THE PATH HAS A GROUP IDENTIFIER, LOAD SIDEBAR WITH 'GroupTopics'
    //CHECK FOR TILDE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // !! to break out of search:
    if (this.app.get('sidebarView').displayed === 'All') {
      this.app.get('sidebarView').displayed = 'Topics';
      //that.app.get('sidebarView').render();
    }

    //need to refactor the custom bounds to the top of this file and use them here

    //COUNTRY
    if (path.split('/').length === 1) {

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

      

    //IF IT'S A COUNTRY WITH STATES (ONLY THE US RIGHT NOW)
    var map = this.get('map');
    } else if (path.split('/').length === 2 && path.split('/')[0] === 'United States') {
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

    if (!this.placing && !groupMode) {
      if (this.app.get('sidebarView').displayed !== 'Topics'
      && this.app.get('sidebarView').displayed !== 'Topics-Top'
      && this.app.get('sidebarView').displayed !== 'Topics-New'
      && this.app.get('sidebarView').displayed !== 'Topics-Hot') {
        this.app.get('sidebarView').displayed = 'Topics-Top';
      }
      this.app.get('content2').hide();
      this.app.trigger('reloadSidebarTopics', path);
    }

  },












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



            //probably need to change pathView, reloadSidebar, and firbounds to the point,
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
    var that = this;
    if (!this.get('cities')) {  //always use this if/else to avoid initializing the polygons more than once
      var citiesLayer = L.layerGroup();
      for (var i=0;i<cities.features.length;i++) {
        var circle = L.circle(L.GeoJSON.coordsToLatLng(cities.features[i].geometry.coordinates), 10000, {
          color:'#fa9e25',
          fillOpacity: 0.2,
          opacity: 0.5
        });
        circle.city = cities.features[i].properties.city;
        circle.on('click', function(e) {
          that.get('map').setZoom(12, { animate:false });
          that.get('map').panTo(e.target._latlng, { animate:false });
          that.set('location', e.target.city);
          that.router.navigate('World/'+e.target.city, { trigger:false });
          if (!that.placing) {
            if (that.app.get('sidebarView').displayed !== 'Topics'
              && that.app.get('sidebarView').displayed !== 'Topics-Top'
              && that.app.get('sidebarView').displayed !== 'Topics-New'
              && that.app.get('sidebarView').displayed !== 'Topics-Hot') {
                that.app.get('sidebarView').displayed = 'Topics-Top';
              } 
            that.set('group', undefined);
            that.trigger('reloadSidebar', e.target.city);
          }
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
  
      function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
        });
      };
  
      function resetHighlight(e) {
        statesLayer.resetStyle(e.target);
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


          that.trigger('reloadSidebar', e.target.feature.properties.name);
        }
        that.set('location', e.target.feature.properties.name);
        that.router.navigate('World/'+e.target.feature.properties.name, { trigger:false });
      };
  
      function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
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
      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 0,
            //color: '#666',
            dashArray: '',
            opacity: 1,
            fillOpacity: 0.3
        });
      };
      function resetHighlight(e) {
        countriesLayer.resetStyle(e.target);
      };
      function clickFeature(e) {
        var name = e.target.feature.properties.name;

        var foo = false;
        for (var i=0;i<that.customBounds.length;i++) {
          if (name === that.customBounds[i].name) {
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
        that.trigger('reloadSidebar', name);
        that.set('location', name);
        that.router.navigate('World/'+e.target.feature.properties.name, { trigger:false });
      };
      function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
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
