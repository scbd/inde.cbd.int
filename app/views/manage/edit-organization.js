define(['app', 'lodash',
  'css!./edit-organization',
    'directives/side-menu/scbd-side-menu',
  './menu-orgs',
  '../../directives/forms/edit/edit-organization',


], function(app, _) { //'scbd-services/utilities',


  app.controller("edit-organization", ['$scope', 'orgMenu', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$timeout', //"$http", "$filter", "Thesaurus",
    function($scope, orgMenu, $q, $http,$filter,$route,mongoStorage,$location,authentication,$timeout) { //, $http, $filter, Thesaurus

      $scope.loading=false;
      $scope.schema="inde-orgs";


      $scope.toggle = orgMenu.toggle;
      $scope.sections = orgMenu.getMenu('dashboard');
      $scope.sectionsOptions = orgMenu.getMenu('editOrgOptions');

      $scope.isNew=true;
      $scope._id = $route.current.params.id;
      if($scope._id.length>3)$scope.isNew=false;

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
      }).then(function(){
        if(!$scope.isAuthenticated)
            $window.location.href='https://accounts.cbd.int/signin?returnUrl=';
      });

      //=======================================================================
      //
      //=======================================================================
      $scope.close = function(){

          $window.history.back();
      };
    }
  ]);
});