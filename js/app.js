var app = angular.module('myApp', []);

app.controller('ctrlMain', function($scope, $interval) {
    $scope.llegadas = [];
    $scope.horaComienzo;
    $scope.elapsed = "--"

    $scope.comenzar = function(key){
      horaComienzo = new Date();
      $interval($scope.updateElapsed, 100);
    }

    $scope.updateElapsed = function(){
      var elapsedDate = (new Date()-horaComienzo);
      //$scope.elapsed = elapsedDate;
      var secs = Math.floor(elapsedDate/1000);
      if(secs<10) secs = "0"+secs;
      var mins = Math.floor(secs/60);
      if(mins<10) mins = "0"+mins;
      var hours = Math.floor(mins/60);
      if(hours<10) hours = "0"+hours;

      $scope.elapsed=hours+":"+mins+":"+secs+"."+elapsedDate;
    }

    $scope.nuevaLlegada = function(){

      $scope.llegadas.push({elapsed: $scope.elapsed, name: ''});
      console.log($scope.llegadas)
    }

});
