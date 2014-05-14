'use strict';

app.controller('discoverLeafletCtrl', ['$scope', function ($scope) {
    
    $scope.slides = [{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7}];
  
    $scope.nextSlide = function(){
        $scope.currentSlide.keyRressCount++;
        if($scope.currentSlide.keyRressCount >= $scope.currentSlide.nextSlideAfterKeyPress){
            if($scope.currentSlide.id>=$scope.slides.length){
              $scope.currentSlide.id = 1; //Loop presentation
            }else{
              $scope.currentSlide.id++; //change template - see ng-include directive in index.html           
            }
            $scope.currentSlide.keyRressCount=0; //Reset click count within slide
            $scope.currentSlide.nextSlideAfterKeyPress = 1; //By default, one click = one slide
        }
    }
    
    $scope.prevSlide = function(){
      $scope.gotoSlide($scope.currentSlide-1);
    }
    
    $scope.gotoSlide = function(slideId){
     $scope.currentSlide = {id:slideId,
                            tblMarkers:[],
                            keyRressCount:0,
                            nextSlideAfterKeyPress:1,
                            currentLayer:'OSM',
                            overlay:{},
                            plugins:{}};     
    }
    
    $scope.gotoSlide(1);
    
}]);
