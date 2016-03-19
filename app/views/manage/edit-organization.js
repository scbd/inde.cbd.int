define(['app',
  '../../directives/forms/edit/edit-organization',
], function(app) { //'scbd-services/utilities',
  app.controller("edit-organization", ['$scope', 'authentication', '$window', '$route','history', //"$http", "$filter", "Thesaurus",
    function($scope, authentication, $window, $route,history) { //, $http, $filter, Thesaurus

      $scope.loading = false;
      $scope.schema = "inde-orgs";


      $scope.isNew = true;
      $scope._id = $route.current.params.id;
      if ($scope._id.length > 3) $scope.isNew = false;

      authentication.getUser().then(function(user) {
        $scope.isAuthenticated = user.isAuthenticated;
      }).then(function() {
        if (!$scope.isAuthenticated)
          $window.location.href = 'https://accounts.cbd.int/signin?returnUrl=';
      });

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