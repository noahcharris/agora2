window.Agora = window.Agora || {};
window.Agora.Views = window.Agora.Views || {};

Agora.Views.SidebarEntryView = Backbone.View.extend({

  tagName: 'li',

  className: 'sidebarEntryView',

  events: {
    'click': 'clickTrigger'
  },

  initialize: function(app) {
    var that = this;

    this.app = app;
    this.topicTemplate = _.template( $('#sidebarTopicEntryTemplate').html() );
    this.RTLtopicTemplate = _.template( $('#RTLsidebarTopicEntryTemplate').html() );
    this.locationTemplate = _.template( $('#sidebarLocationEntryTemplate').html() );
    this.channelTemplate = _.template( $('#sidebarChannelEntryTemplate').html() );
    this.userTemplate = _.template( $('#sidebarUserEntryTemplate').html() );
    this.RTLuserTemplate = _.template( $('#RTLsidebarUserEntryTemplate').html() );
    this.messageChainTemplate = _.template( $('#sidebarMessageChainEntryTemplate').html() );

    this.coordsObject = {};


                                            //this is a temp workaround for
                                            //location and channel search result
    this.mouseoverHandler = _.once(function (search) {

        console.log('MOUSEOVER');
      
        //var data = that.model.locations;

        //for (var i=0; i < data.length ;i++) {

          var f = function() {
            var x;
            if (!search) {
              x = that.model.location;
            } else {
              x = that.model.name;
            }

            var temp;
            if (!search) {
              temp = that.model.location;
            } else {
              temp = that.model.name;
            }


            if (temp === 'World') {

              that.app.get('mapController').highlightWorld();
              that.$el.on('mouseover', function() {
                that.app.get('mapController').highlightWorld();
              });
              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightWorld();
              });

            } else if (temp.split('/').length === 2) {
              //COUNTRY
              that.app.get('mapController').highlightCountry(temp);
              that.$el.on('mouseover', function() {
                that.app.get('mapController').highlightCountry(temp);
              });
              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightCountry(temp);
              });


            } else if (temp.split('/').length === 3 && temp.split('/')[1] === 'United States') {
              //COUNTRY WITH PROVINCES
              var temp1 = temp.split('/');
              temp1.pop();
              var temp2 = temp1.join('/');

              var zoom = that.app.get('mapController').get('map').getZoom();
              //CHECK IF THE MAP IS ABOVE A CERTAIN ZOOM LEVEL, SHOW THE COUNTRY, ELSE SHOW THE STATE
              if (zoom > 3) {
                //HIGHLIGHT STATE
                that.app.get('mapController').highlightState(temp);
              } else {
                that.app.get('mapController').highlightCountry(temp2);
              }


              that.$el.on('mouseover', function() {
                var zoom = that.app.get('mapController').get('map').getZoom();
                //CHECK IF THE MAP IS ABOVE A CERTAIN ZOOM LEVEL, SHOW THE COUNTRY, ELSE SHOW THE STATE
                if (zoom > 3) {
                  //HIGHLIGHT STATE
                  that.app.get('mapController').highlightState(temp);
                } else {
                  that.app.get('mapController').highlightCountry(temp2);
                }
              });



              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightState(temp);
                that.app.get('mapController').removeHighlightCountry(temp2);
              });



            } else if (temp.split('/').length === 3 || (temp.split('/').length === 4 && temp.split('/')[1] === 'United States')) {
              //CITY

              var temp1 = temp.split('/');
              var temp2;
              //IF US (THE ONLY COUNTRY WITH PROVINCES ATM)
              if (temp1[1] === 'United States') {
                temp1.pop();
                temp1.pop();
                temp2 = temp1.join('/');
              } else {
                temp1.pop();
                temp2 = temp1.join('/');
              }


              that.app.get('mapController').highlightCity(temp);
              that.$el.on('mouseover', function() {
                that.app.get('mapController').highlightCity(temp);
                //CHECK IF THE MAP IS ABOVE A CERTAIN ZOOM LEVEL, SHOW THE COUNTRY, ELSE SHOW THE CITY
                // var zoom = that.app.get('mapController').get('map').getZoom();
                // if (zoom > 3) {
                //   //HIGHLIGHT CITY
                // } else {
                //   that.app.get('mapController').highlightCountry(temp2)
                // }
              });
              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightCity(temp);
                that.app.get('mapController').removeHighlightCountry(temp2);
              });

            } else {
              //USER 'PLACE'

              var temp1 = temp.split('/');
              var temp2;
              //IF US (THE ONLY COUNTRY WITH PROVINCES ATM)
              if (temp1[1] === 'United States') {
                temp1.pop();
                temp1.pop();
                temp1.pop();
                temp2 = temp1.join('/');
              } else {
                temp1.pop();
                temp1.pop();
                temp2 = temp1.join('/');
              }


              if (that.coordsObject[temp]) {

                that.$el.on('mouseover', function() {
                  that.app.get('mapController').highlightPlace(temp, that.coordsObject[temp][0], that.coordsObject[temp][1]);
                });
                that.app.get('mapController').highlightPlace(temp, that.coordsObject[temp][0], that.coordsObject[temp][1]);
                //CHECK IF THE MAP IS ABOVE A CERTAIN ZOOM LEVEL, SHOW THE COUNTRY, ELSE SHOW THE PLACE
                // var zoom = that.app.get('mapController').get('map').getZoom();
                // if (zoom > 3) {
                //   //HIGHLIGHT PLACE
                //   that.app.get('mapController').highlightPlace(temp, that.coordsObject[temp][0], that.coordsObject[temp][1]);
                // } else {
                //   that.app.get('mapController').highlightCountry(temp2)
                // }

              } else {

                $.ajax({
                  url: 'http://egora.co:80/placeLatLng',
                  crossDomain: true,
                  method: 'GET',
                  data: {
                    name: temp
                  },
                  success: function(data) {
                    if (data.length) {
                      that.coordsObject[temp] = [data[0].latitude, data[0].longitude];

                      var zoom = that.app.get('mapController').get('map').getZoom();
                      //CHECK IF THE MAP IS ABOVE A CERTAIN ZOOM LEVEL, SHOW THE COUNTRY, ELSE SHOW THE PLACE
                      that.$el.on('mouseover', function() {
                        that.app.get('mapController').highlightPlace(temp, data[0].latitude, data[0].longitude);
                      });
                      that.app.get('mapController').highlightPlace(temp, data[0].latitude, data[0].longitude);

                      // if (zoom > 3) {
                      //   //HIGHLIGHT PLACE
                      //   that.app.get('mapController').highlightPlace(temp, data[0].latitude, data[0].longitude);
                      // } else {
                      //   that.app.get('mapController').highlightCountry(temp2)
                      // }

                    } else {
                    }
                  }, error: function(err) {
                    console.log('ajax error ocurred: ', err);
                  }

                });
              }


              that.$el.on('mouseout', function() {
                that.app.get('mapController').removeHighlightPlace(temp);
                that.app.get('mapController').removeHighlightCountry(temp2);
              });


            }//end if-else chain





          };
          f();
        //}

    });





  },



















  renderTopic: function() {
    var that = this;

    //have to change location just for the templating:
    var model2 = JSON.parse(JSON.stringify(this.model));
    var temp = model2.location.split('/');
    model2.location = temp[temp.length-1];
    //model2.location = model2.location.split('/')[model2.location.split('/')];


    //TRANSLATIONS
    var userLabel = this.app.translate('User');
    var locationLabel = this.app.translate('To');
    model2.userLabel = userLabel;
    model2.locationLabel = locationLabel;

    if (this.app.get('language') !== 'ar') {
      this.$el.html( this.topicTemplate(model2) );
    } else {
      this.$el.html( this.RTLtopicTemplate(model2) );
    }




    if (!this.model.image) {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').css('width', '0px');
    } else {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').attr('src', this.model.image);
    }



    //IMAGE OVERLAY
    (function() {
      var on = false;
      that.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').on('click', function(e) {
        e.stopPropagation();
        if (!that.app.get('imageFullscreen')) {
          on = true;
          that.app.set('imageFullscreen', true);
          var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image +'"></img></div>')
          $overlayImage.on('click', function() {
            $(this).fadeOut(333, function() {
              $(this).remove();
              on = false;
              that.app.set('imageFullscreen', false);
            });
          });
          $('#mainWrapper').append($overlayImage);
          $overlayImage.hide();
          $overlayImage.fadeIn(333);
        }
      });
    })();



    var $username = that.$el.children('.sidebarFloatClear').children('.contentAndToFromWrapper').children('.sidebarToFromWrapper').children('.topString').children('.sidebarUsername');
    $username.on('click', function(e) {
      $.ajax({
        url: 'http://egora.co:80/user',
        // url: 'http://localhost:80/user',
        method: 'GET',
        crossDomain: true,
        data: {
          username: that.model.username,
          //so that this is never cached
        },
        success: function(data) {
          if (data) {

            that.app.get('detailView').displayed = 'Users';

            that.app.get('content2').show(that.app.get('detailView'), data[0]);
          } else {
            console.log('no data returned from server');
          }
        }, error: function(err) {
          console.log('ajax error ocurred: ', err);
        }

      });

      e.stopPropagation();

    });

    var $toString = that.$el.children('.sidebarFloatClear').children('.contentAndToFromWrapper').children('.sidebarToFromWrapper').children('.topString').children('.locationString');
    $toString.on('click', function(e) {
      that.app.get('mapController').goToPath(that.model.location);
      e.stopPropagation();
    });

    var $channelString = that.$el.children('.sidebarFloatClear').children('.contentAndToFromWrapper').children('.sidebarToFromWrapper').children('.topString').children('.sidebarChannelString');
    $channelString.on('click', function(e) {
      that.app.changeChannel(that.model.channel);
      that.app.trigger('reloadSidebarTopics');
      e.stopPropagation();
    });


    



    if (!this.noMouseover) {
      this.$el.on('mouseover', function() {
        that.mouseoverHandler(false);
      });
    }




  },

  renderLocation: function() {
    var that = this;
    this.$el.html( this.locationTemplate(this.model) );

    if (!this.noMouseover) {
      this.$el.on('mouseover', function() {
        that.mouseoverHandler(true);
      });
    }
  },

  renderChannel: function() {
    this.$el.html( this.channelTemplate(this.model) );

    //MOUSEOVER FOR THIS WILL BE WAYY MORE COMPLICATED IF IT HAPPENS
    //DOWN THE LINE
  },

  renderUser: function() {
    var that = this;

    var tempModel = JSON.parse(JSON.stringify(this.model));
    var temp = tempModel.location.split('/');
    var temp2 = temp.slice(1, temp.length);
    tempModel.location = temp2.join('/');

    tempModel.locationLabel = that.app.translate('Location');

    if (that.app.get('language') !== 'ar') {
      this.$el.html( this.userTemplate(tempModel) );
    } else {
      this.$el.html( this.RTLuserTemplate(tempModel) );
    }

    if (!this.model.image) {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').css('width', '0px');
    } else {
      this.$el.children('.sidebarFloatClear').children('.sidebarTopicImage').attr('src', this.model.image);
    }

    //IMAGE OVERLAY
    (function() {
      var on = false;
      that.$el.children('.sidebarFloatClear').children('.sidebarTopicImage')[0].onclick = function(e) {
        e.stopPropagation();
        if (!that.app.get('imageFullscreen')) {
          on = true;
          that.app.set('imageFullscreen', true);
          var $overlayImage = $('<div id="fullscreen"><img id=fullscreenImage" src="'+ that.model.image +'"></img></div>')
          $overlayImage.on('click', function() {
            $(this).fadeOut(333, function() {
              $(this).remove();
              on = false;
              that.app.set('imageFullscreen', false);
            });
          });
          $('#mainWrapper').append($overlayImage);
          $overlayImage.hide();
          $overlayImage.fadeIn(333);
        }
      };
    })();


    //mouseover
    if (!this.noMouseover) {
      this.$el.on('mouseover', function() {
        that.mouseoverHandler(false);
      });
    }

  },

  renderMessageChain: function() {

    var that = this;

    //have to do a little reshuffling..
    if (this.model.username1 === this.app.get('username')) {
      this.model.contact = this.model.username2;
    } else {
      this.model.contact = this.model.username1;
    }
    this.model.recipientLabel = this.app.translate('Recipient');

    //format the date yo
    var tempModel = JSON.parse(JSON.stringify(this.model));
    var temp = new Date(tempModel.lastmessage);
    var temp2 = String(temp).split(' ');
    var temp3 = temp2.slice(1);
    tempModel.lastmessage = temp3.join(' ');


    this.$el.html( this.messageChainTemplate(tempModel) );

  },

  clickTrigger: function() {
    //have to remember to call model.get when not using .toJSON()
    this.trigger('click', this.model.id, this.model.type);
  },

  close: function() {
    this.remove();
    this.unbind();
  }
});
