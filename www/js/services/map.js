angular.module('starter.services')

.factory('MapService', function($q) {
    return {
        lastPull: new Date(),
        mapState: null,
        watching: false,
        lastPosition: null,
        circleMarker: null,
        stepTime: 60,
        transitionArray: [],
        setLastPosition: function(latLng){
            this.lastPosition = latLng;
        },
        getLocation: function(){
            var _self = this;
            var q = $q.defer();

            document.addEventListener("deviceready", function(){
                navigator.geolocation.getCurrentPosition(
                    function(pos){

                        locationPickerPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude};
                            locationPickerPosition = new plugin.google.maps.LatLng(
                                pos.coords.latitude,
                                pos.coords.longitude
                            );

                            _self.setLastPosition(locationPickerPosition);
                        q.resolve(locationPickerPosition);
                    },
                    function(error){ console.log(error) },
                    { enableHighAccuracy: true } 
                );
            });

            return q.promise;
        },
        toggleWatchLocation: function(toggle){
            var _self = this;
            _self.watching = toggle;

            if(_self.watching){
                //Initialize
                brightness.setKeepScreenOn(true);
                map.setZoom(18);
                console.log('starting Watch');
                watchTimer = navigator.geolocation.watchPosition(
                    function(position){
                        _self.transition(position);
                    },
                    function(error){ console.log(error);},
                    { maximumAge: 600000, timeout: 5000,enableHighAccuracy: true}
                );

            } else {
                console.log('stopping Watch');
                brightness.setKeepScreenOn(false);
                navigator.geolocation.clearWatch(watchTimer);
                _self.transitionArray = [];

            }
        },
        transition: function( pos ){
            if(!this.watching) return;
            var timeDiff = (new Date() - this.lastPull );
            this.transitionArray = [];
            this.stepTime = 60;

            var numOfMeters = pos.coords.speed * (timeDiff/1000);
            var maxSteps = (timeDiff/1000) * (1000/this.stepTime); //Number of steps within time block
            var numDeltas = Math.min(numOfMeters,maxSteps);

            if(numOfMeters < maxSteps){
                this.stepTime = timeDiff/numOfMeters;
            }

            console.log('deltas', numDeltas);
            console.log('stepTime', this.stepTime);

            var toPos = new plugin.google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
            );


            if(pos.coords.speed < 1) return;



            this.lastPull = new Date();

            
            //Store starting position
            var sLat = this.lastPosition.lat;
            var sLng = this.lastPosition.lng;

            //Store Last Position
            this.setLastPosition(toPos);

            //Get distance between transition points
            var deltaLat = ( toPos.lat - sLat ) / numDeltas;
            var deltaLng = ( toPos.lng - sLng ) / numDeltas;  

            // Move Camera
            map.getCameraPosition(function(camera) {

                map.animateCamera({
                  'target': toPos,
                  'tilt': camera.tilt,
                  'zoom': camera.zoom,
                  'bearing': pos.coords.heading,
                  'duration': 2000 // = 5 sec.
                });
                
            });

            //Build Array of points
            for (var i = 0; i < numDeltas; i++) {
                sLat += deltaLat;
                sLng += deltaLng;
                this.transitionArray.push(new plugin.google.maps.LatLng(sLat,sLng));
            }

            //Start the moving process
            this.moveMarker();

        },
        moveMarker: function (){
            if(!this.transitionArray.length) return false;
            var _self = this;
            var nextPoint = this.transitionArray[0];

            // Move Marker
            if(_self.circleMarker == null){

                map.addCircle({
                    'center': nextPoint,
                    'radius': 2,
                    'strokeColor' : '#ffffff',
                    'strokeWidth': 1,
                    'fillColor' : '#41b1ff'

                }, function ( marker ){
                    _self.circleMarker = marker;
                });

            } else {

                _self.circleMarker.setCenter(nextPoint);

            }

            // Set the new Last Point
            _self.setLastPosition(nextPoint);

            // Remove the point off the front
            this.transitionArray.shift();
            
            // Rerun moveMarker with the new position until the array is empty
            if(this.transitionArray.length) setTimeout( function(){_self.moveMarker()}, _self.stepTime );

        },
        pickLocation: function(showPopup,latitude,longitude){
            var _self = this;
            console.log('oldState',this.mapState );
            if(showPopup){
                this.mapState = 'popup';
            } else {
                this.mapState = 'view';
            }
            console.log('showPopup',showPopup,this.mapState );
            var q = $q.defer();
            document.addEventListener("deviceready", function(){

            // navigator.geolocation.getCurrentPosition(function(pos){

                var currentPosition = new plugin.google.maps.LatLng(
                    latitude,
                    longitude
                );
                _self.setLastPosition(currentPosition);


                if(typeof map === "undefined" || map == null){
                    map = plugin.google.maps.Map.getMap();

                    map.setOptions({
                        'backgroundColor': 'white',
                        'mapType': plugin.google.maps.MapTypeId.HYBRID,
                        'controls': {
                          'compass': true,
                          'myLocationButton': false,
                          'zoom': true // Only for Android
                        },
                        'gestures': {
                          'scroll': true,
                          'zoom': true
                        },
                        'camera': {
                          'latLng': currentPosition,
                          'zoom': 16
                        }
                    });

                    map.addEventListener(plugin.google.maps.event.MAP_CLOSE, function() {
                        q.resolve(locationPickerPosition);
                    });
                    
                } else {

                    map.setCenter( currentPosition );

                }

                if(showPopup){
                    //map.setMyLocationEnabled( true );
                    console.log('showingPopup');
                    if(typeof locationPin === "undefined"){
                        console.log('were creating');

                        map.addMarker({
                            'position': currentPosition,
                            'snippet': 'Hold down for 2 sec.\nDrag marker to inspection location\nClick close when done',
                            'disableAutoPan': true,
                            // 'icon': {
                            //     'url': 'img/marker.png'
                            // },
                            'draggable': true
                        }, function(marker) {
                            locationPin = marker;
                            marker.showInfoWindow();
                            marker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function(marker) {
                                marker.getPosition(function(latLng) {
                                    marker.showInfoWindow();
                                    locationPickerPosition = latLng;
                                    map.addEventListener(plugin.google.maps.event.MAP_CLOSE, function() {
                                        locationPin.setVisible(false);
                                        q.resolve(latLng);
                                    });


                                });
                            });
                        });         
                        
                    } else {
                        console.log('were moving');
                        locationPin.setVisible(true);
                        locationPin.setPosition( locationPickerPosition );

                    }
           
                    map.showDialog();

                } else {
                    console.log('No Popup');
                    q.resolve(locationPickerPosition);
                    map.setDiv(document.getElementById( "map_canvas" ));
                    //map.setMyLocationEnabled(false);

                }
       
            // },
            // resOnError);

            });
            return q.promise;
        }
    }
})
