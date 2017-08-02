var companyControllers = angular.module('companyControllers', ['ngAnimate']);

companyControllers.controller('ListController', ['$scope', '$http', function($scope, $http) {
    $http.get('js/data.json').success(function(data) {
      $scope.organizations = data;
      console.log("organizations inside http.get");
      console.log($scope.organizations);
    }); // End HTTP Get
   
  
    /*** Search Data and Functions ***/
    $scope.searchResults = [];
  
    /* Search begin */
    $scope.searchValues = function(){
      //$scope.searchResults = $scope.searchResults.concat(newArrValues);
      console.log("Posting Search Values", $scope.searchResults);
      $scope.searchV = $scope.searchResults.join(", ");
      console.log("Searching For: ", $scope.searchV);
      return $scope.searchV;
    }/* Search end */
    
    /* clearValues begin */
    $scope.clearValues = function(){
      $scope.searchResults.forEach(function(x){
        $scope.categoryModel[x] = false;
      });
      $scope.searchResults = [];
      $scope.searchV = ""
      console.log("Search Results Array Has Been Reset To: " + $scope.searchResults);
      console.log("Search V Has Been Reset To: " + $scope.searchV);
      console.log("Category Model Reset to: " + JSON.stringify($scope.categoryModel));
      return;
    }/* clearValues end */

    /* Category Model */
    $scope.categoryModel = {
      /* col 1 */
      'Non-Profit Organization': false,
      'Religious': false,
      'Government Acency': false,
      'Government Subsidy': false,
      /* col 2 */
      'For-Profit': false,
      'Community-Based Organization or Individual': false,
      'Research and Studies': false,
      'Food Resource': false,
      /* col 3 */
      'Farming / Gardening': false,
      'Legislation': false,
      'Advocacy': false,
      'Food Waste': false,
      /* col 4 */
      'Skill Building / Educational': false,
      'Economic and Community Development': false,
      'Youth': false,
      'WIC': false,
      /* col 5 */
      'Seniors': false,
      'Obese': false
    };
  
    $scope.$watchCollection('categoryModel', function(){
      $scope.searchResults = [];
      angular.forEach($scope.categoryModel, function(value, key){
        if(value){
          $scope.searchResults.push(key);
        }
      }); // End forEach
      console.log("Updating Categories Search Results");
      console.log($scope.searchResults);
    });// End watchCollection
  
}]);

companyControllers.controller('DetailsController', ['$scope', '$http','$routeParams', function($scope, $http, $routeParams) {
    $http.get('js/data.json').success(function(data) {
      $scope.organizations = data;
      $scope.whichItem = $routeParams.itemId;

      if ($routeParams.itemId > 0) {
        $scope.prevItem = Number($routeParams.itemId)-1;
      } else {
        $scope.prevItem = $scope.organizations.length-1;
      }

      if ($routeParams.itemId < $scope.organizations.length-1) {
        $scope.nextItem = Number($routeParams.itemId)+1;
      } else {
        $scope.nextItem = 0;
      }

    });
}]);

