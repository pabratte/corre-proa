var app = angular.module('myApp', []);
var fs = require('fs');

app.directive('capitalize', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if(inputValue == undefined) inputValue = '';
           var capitalized = inputValue.toUpperCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
});

app.controller('ctrlMain', function($scope, $interval) {
    $scope.llegadas = [];
    $scope.participantes = [];
    $scope.nuevoParticipanteValido = {nombre: true, apellido: true, dni: true};
    $scope.horaComienzo;
    $scope.elapsed = "--"
    $scope.ultimoParticipanteRegistrado = null;
    $scope.pestaniaActiva = 1

    $scope.activarPestania = function(p){
      $scope.pestaniaActiva = p;
    }


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

    $scope.validarNuevoParticipante = function(){
      $scope.nuevoParticipanteValido.nombre = $scope.nuevoParticipanteValido.apellido = $scope.nuevoParticipanteValido.dni = false;

      if($scope.nuevoParticipante.apellido === ''){
        $scope.nuevoParticipanteValido.apellido = true;
        return false;
      }else if($scope.nuevoParticipante.nombre === ''){
        $scope.nuevoParticipanteValido.nombre = true;
        return false;
      }else if($scope.nuevoParticipante.dni === ''){
        $scope.nuevoParticipanteValido.dni = true;
        return false;
      }else{
        return true;
      }

    }

    limpiarNuevoParticipante = function(){
      $scope.nuevoParticipante = {apellido: '', nombre: '', dni: ''};
      $scope.generarNuevoNroParticipante();
      $scope.nuevoParticipanteValido.nombre = $scope.nuevoParticipanteValido.apellido = $scope.nuevoParticipanteValido.dni = false;
    }

    $scope.agregarParticipante = function(){
      if(!$scope.validarNuevoParticipante()) return;
      $scope.participantes.push({dni: $scope.nuevoParticipante.dni, apellido: $scope.nuevoParticipante.apellido, nombre: $scope.nuevoParticipante.nombre, nro: $scope.nuevoParticipante.nro});
      guardarParticipantes();
      $scope.ultimoParticipanteRegistrado = {dni: $scope.nuevoParticipante.dni, apellido: $scope.nuevoParticipante.apellido, nombre: $scope.nuevoParticipante.nombre, nro: $scope.nuevoParticipante.nro}
      limpiarNuevoParticipante();
    }

    $scope.generarNuevoNroParticipante = function(){
      $scope.nuevoParticipante.nro = obtenerNuevoNroParticipante();
    }

    obtenerNuevoNroParticipante = function(){
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

    guardarParticipantes = function(){
      fs.writeFile("participantes.json", JSON.stringify($scope.participantes), function(err) {
          if(err) {
              alert("ERROR guardando archivo participantes.jdon: "+err);
          }
      });

    }

    cargarParticipantes = function(){
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
    limpiarNuevoParticipante();
    cargarParticipantes();
    $scope.generarNuevoNroParticipante();
});


var path = './';
/*
fs.watch(path, function() {
    if (location)
    location.reload();
});
*/
