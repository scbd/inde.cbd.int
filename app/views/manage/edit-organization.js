define(['app',
  '../../directives/forms/edit/edit-organization',
], function(app) {
  app.controller("edit-organization", ['$scope',  '$window', '$route','history',
    function($scope,  $window, $route,history) {

      $scope.loading = false;
      $scope.schema = "inde-orgs";
      $scope.isNew = true;

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