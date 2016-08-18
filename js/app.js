var app = angular.module('myApp', []);
fs = require('fs');

app.controller('ctrlMain', function($scope, $interval) {
    $scope.llegadas = [];
    $scope.horaComienzo;
    $scope.elapsed = "--"
    $scope.nuevoParticipante = {nombre: '', nro: ''};
    $scope.nuevo_participante_nombre = '';



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

    $scope.agregarParticipante = function(){
      if($scope.nuevo_participante_nombre == '') return;
      $scope.nuevoParticipante.nombre = $scope.nuevo_participante_nombre;
      $scope.nuevoParticipante.nro = $scope.obtenerNuevoNroParticipante();
      $scope.participantes.push({nombre: $scope.nuevoParticipante.nombre, nro: $scope.nuevoParticipante.nro});
      $scope.nuevo_participante_nombre = '';
      $scope.guardarParticipantes();
    }

    $scope.obtenerNuevoNroParticipante = function(){
        var repetido = true;
        var nro = 0;
        while(repetido){
          repetido = false;
          var nro = Math.floor(Math.random() * 100) + 100;
          for(var i = 0; i<$scope.participantes.length; i++){
            if($scope.participantes[i].nro == nro){
              repetido = true;
              break;
            }
          }
        }
        return nro;
    }

    $scope.guardarParticipantes = function(){
      fs.writeFile("participantes.json", JSON.stringify($scope.participantes), function(err) {
          if(err) {
              alert("ERROR guardando archivo participantes.jdon: "+err);
          }
      });

    }

    $scope.cargarParticipantes = function(){
      fs.readFile('participantes.json', "utf8", function(err, data){
        if(err) {
            console.log("ERROR leyendo archivo participantes.json: "+err);
            $scope.participantes = [];
        }else{
            $scope.participantes = JSON.parse(data);
        }
        $scope.$apply();
      });

    }
    $scope.cargarParticipantes();

});
