'use strict';

app.directive('discoverLeaflet', ['$compile','$timeout', function ($compile,$timeout) {
    return {
      scope:{
      	markers : '=',
        layer : '=',
        overlay : '=',
        plugins : '=',
      },		
      link: function (scope, elem, attrs) {

        //Initialise Leaflet map - zoom and center on La Maison des Projets
        scope.lMap = new L.Map(attrs.id);
        scope.lMap.setView([47.473823,-0.551677], 17,{pan:{animate:true,duration:1}});
        scope.lMap.zoomControl.setPosition('bottomright');

        var lMarkers = L.layerGroup(); //Used to handle displayed markers (show/hide)
        lMarkers.addTo(scope.lMap);
        
        //Open Street Map layer  
        var osmLayer = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                                          attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"});
        osmLayer.addTo(scope.lMap);
        
        //Google Maps layer
        var googleLayer = new L.Google();

        //BING Layer
        var bingLayer = new L.BingLayer("AgPDsvIdmDe3OC0VcJThz2UGzgs2EBqEEVYf-RFNTNG68jifnPEzk80FPCOzIM4a");
        
        var mapboxLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/willylambert.i7fn3530/{z}/{x}/{y}.png', {
            attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
        });
    
        //ALM - eau potable
        var almWaterLayer = new L.KML("data/reseau_eau_potable_alm.kml", {async: true});      
        
        //Etang St Nicolas walk
        var stNicolasLayer = new L.KML("data/etang_st_nicolas.kml", {async: true});
        var stNicolasAnimatedMarker = {};
        stNicolasLayer.on("loaded", function(e) { 
           stNicolasAnimatedMarker = L.animatedMarker(e.target.latLngs,{                    
                    distance: 300,  
                    interval: 2000,
                    icon: L.AwesomeMarkers.icon({icon: 'user', markerColor: 'green'})
           });
        });          
      
        //Borne incendie
        var almFireLayer = new L.KML("data/borne_incendie.kml", {async: true});
        var fireMarkersCluster = new L.MarkerClusterGroup();  
        almFireLayer.on("loaded", function(e) {           
          for(var i=0;i<e.target.latLngs.length;i++){
            fireMarkersCluster.addLayer(new L.Marker(e.target.latLngs[i]));
          }
          
        });      
              
        //Each slide may update the markers variable - update map accordingly  
        scope.$watch(function(){
            return scope.markers;
        },function(){
            if(scope.markers!=undefined){
              lMarkers.clearLayers();
              var tblLatLngs = [];
              angular.forEach(scope.markers, function (marker, idx) {                         
                  $timeout(function(){
                    var lMarker = L.marker(marker.coord);
                    if(marker.icon!=undefined){
                      lMarker.setIcon(L.icon({iconUrl:marker.icon}));
                    }
                    tblLatLngs.push(marker.coord);
                    lMarker.addTo(lMarkers).bindPopup(marker.label).openPopup();  
                    //Last marker - fit map bound to view alls
                    if(idx==scope.markers.length-1){
                      console.log(lMarkers);
                      scope.lMap.fitBounds(L.latLngBounds(tblLatLngs));
                    }
                  },1000*idx);
              });              
            }            
        },true);
          
        scope.$watch(function(){
            return scope.layer;
        },function(){
            switch(scope.layer){
                case 'OSM' :                    
                    scope.lMap.removeLayer(googleLayer);
                    scope.lMap.removeLayer(bingLayer);
                    scope.lMap.removeLayer(mapboxLayer);
                    scope.lMap.addLayer(osmLayer);
                    break;
                case 'GM' :
                    scope.lMap.removeLayer(osmLayer);
                    scope.lMap.removeLayer(bingLayer);
                    scope.lMap.removeLayer(mapboxLayer);
                    scope.lMap.addLayer(googleLayer);                   
                    break;
                case 'BING' : 
                    scope.lMap.removeLayer(osmLayer);
                    scope.lMap.removeLayer(googleLayer);
                    scope.lMap.removeLayer(mapboxLayer);
                    scope.lMap.addLayer( bingLayer);  
                    break;
                case 'MAPBOX' : 
                    scope.lMap.removeLayer(osmLayer);
                    scope.lMap.removeLayer(googleLayer);
                    scope.lMap.removeLayer(bingLayer);  
                    scope.lMap.addLayer(mapboxLayer);
                    break;
            }
        },true);
        
        //Handle show/hide of overlay layers
        scope.$watch(function(){
          return scope.overlay;
        },function(){
          if(scope.overlay.ALM_FIRE){
            almFireLayer.addTo(scope.lMap);
          }else{
            scope.lMap.removeLayer(almFireLayer);
          }
          if(scope.overlay.ALM_WATER){
            scope.lMap.fitBounds(L.latLngBounds(almWaterLayer.latLngs));
            almWaterLayer.addTo(scope.lMap);
          }else{
            scope.lMap.removeLayer(almWaterLayer);
          }
          if(scope.overlay.REFERENCES){
            scope.displayReferences();
          }
        },true);

        //Handle plugins activation
        scope.$watch(function(){
          return scope.plugins;
        },function(){
          if(scope.plugins!=undefined){
            //MARKERS CLUSTER
            if(scope.plugins.MARKERS_CLUSTER){
              fireMarkersCluster.addTo(scope.lMap);
            }else{
              scope.lMap.removeLayer(fireMarkersCluster);
            }
            //ANIMATED MARKERS
            if(scope.plugins.ANIMATED_MARKERS){
              stNicolasAnimatedMarker.addTo(scope.lMap);
              scope.lMap.fitBounds(L.latLngBounds(stNicolasAnimatedMarker._latlngs));
            }else{
              scope.lMap.removeLayer(stNicolasAnimatedMarker);            
            }
          }
        },true);
      
      }
    }
}]);