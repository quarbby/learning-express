var app = angular.module('tww', ['tww.filters', 'tww.services', 'tww.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: './views/index.jade',
        controller: 'MainCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);

app.controller('MainCtrl', ['$scope', '$http', 
    function ($scope, $http) {
      console.log('Inside Main Controller');
      $scope.init = function() {
          var map = L.map('map', {
      			center: [1.289545, 103.849972],
      			zoom: 5,
      			zoomControl: true
      		});
      
      var defaultLayer = L.tileLayer.provider('Esri.WorldStreetMap').addTo(map);  
      }
      
      console.log("Test Angular");
      $scope.init();
    }
]);
