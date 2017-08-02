var myApp = angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize', 
  'ui.bootstrap',
  'angular.filter',
  'companyControllers'
]);

myApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/list', {
    templateUrl: 'partials/list.html',
    controller: 'ListController'
  }).
  when('/company', {
    templateUrl: 'partials/checkDirectory.html',
    controller: 'CompanyController'
  }).
  otherwise({
    redirectTo: '/list'
  });
}]);