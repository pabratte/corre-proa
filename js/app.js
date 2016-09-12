var app = angular.module('myApp', ['ui.bootstrap']);
var fs = require('fs');
var Webcam = require('./lib/webcam.min.js')

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
    $scope.pestaniaActiva = 1
    $scope.participantes = [];
    $scope.nuevoParticipanteValido = {nombre: true, apellido: true, dni: true};
    $scope.ultimoParticipanteRegistrado = null;

    $scope.activarPestania = function(p){
      $scope.pestaniaActiva = p;
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

    $scope.eliminar_participante = function(participante){
      for(var i = 0; i<$scope.participantes.length; i++){
        if($scope.participantes[i] === participante){
          $scope.participantes.splice(i,1);
        }
      }
    }

    $scope.obtenerParticipantes = function(filterVal){
      filterVal = filterVal.toLowerCase();
      var part = [];
      for(var i = 0; i<$scope.participantes.length; i++){
        var str = $scope.participantes[i].nombre+ ' '+$scope.participantes[i].apellido+' '+$scope.participantes[i].nro;
        str = str.toLowerCase();
        if(str.search(filterVal) !== -1){
          part.push($scope.participantes[i]);
        }
      }
      return part;
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

    // --------------- CORRER -----------------
    $scope.ultimasLlegadas = [];
    $scope.llegadas = [];
    $scope.horaComienzo;
    $scope.elapsed = "00:00:00:00";
    $scope.isPaused = true;
    var Timer = require('./lib/easytimer.min.js');
    var timer = new Timer();

    $scope.comenzar = function(){
      $scope.isPaused = !$scope.isPaused;
      if(!$scope.isPaused){
        timer.start();
      }else{
        timer.pause();
      }
    }

    $scope.reiniciar = function(){
      timer = null;
      timer = new Timer();
      timer.start({precision: 'secondTenths', callback: function (values) {
          $scope.elapsed = timer.getTimeValues().toString(['hours', 'minutes', 'seconds', 'secondTenths']);
          $scope.$apply();
        }
      });
      $scope.isPaused = true;
      timer.pause();
      $scope.elapsed = "00:00:00:00";
    }
    $scope.reiniciar();

    $scope.nuevaLlegada = function(){
      if($scope.isPaused) return;
      var llegada = {tiempo: $scope.elapsed, participante: '', pos: 0, foto: ''};
      llegada.pos = $scope.llegadas.length + $scope.ultimasLlegadas.length + 1;
      $scope.ultimasLlegadas.push(llegada);
    }

    $scope.agregarLlegada = function (pos, tiempo, participante){
      $scope.llegadas.push({pos: pos, tiempo: tiempo, participante: participante});
      // eliminar ese elemento de ultimasLlegadas
      for(var i = 0; i<$scope.ultimasLlegadas.length; i++){
        if($scope.ultimasLlegadas[i].pos == pos){
          $scope.ultimasLlegadas.splice(i,1);
          break;
        }
      }
      guardarLlegadas();
    }

    guardarLlegadas = function(){
      fs.writeFile("llegadas.json", JSON.stringify($scope.llegadas), function(err) {
          if(err) {
              alert("ERROR guardando archivo llegadas.jdon: "+err);
          }
      });

    }

    cargarLlegadas = function(){
      fs.readFile('llegadas.json', "utf8", function(err, data){
        if(err) {
            console.log("ERROR leyendo archivo llegadas.json: "+err);
            $scope.llegadas = [];
        }else{
            $scope.llegadas = JSON.parse(data);
        }
        $scope.$apply();
      });
    }
    cargarLlegadas();
});


//var gulp = require('gulp');
//gulp.task('reload', function () {
//  if (location) location.reload();
//});

//gulp.watch('**/*', ['reload']);
