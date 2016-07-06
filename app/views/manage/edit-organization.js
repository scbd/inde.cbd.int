define(['app',
  '../../directives/forms/edit/edit-organization',
], function(app) { 
  app.controller("edit-organization", ['$scope',  '$window', '$route','history', //"$http", "$filter", "Thesaurus",
    function($scope,  $window, $route,history) { //, $http, $filter, Thesaurus

      $scope.loading = false;
      $scope.schema = "inde-orgs";


      $scope.isNew = true;
      $scope._id = $route.current.params.id;
      if ($scope._id.length > 3) $scope.isNew = false;



      //=======================================================================
      //
      //=======================================================================
      $scope.close = function() {

        history.goBack();
      };
      //=======================================================================
      //
      //=======================================================================
      $scope.prev = history.getPrevPath();
    }
  ]);
});