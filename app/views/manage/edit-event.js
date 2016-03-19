define(['app', 'lodash',

  '../../directives/side-menu/scbd-side-menu',
  '../../directives/scbd-button',
  './menu',
  '../../directives/forms/edit/edit-side-event',
    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',


  app.controller("edit-event", ['$scope', 'dashMenu', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$timeout','$window','history', //"$http", "$filter", "Thesaurus",
    function($scope, dashMenu, $q, $http,$filter,$route,mongoStorage,$location,authentication,$timeout,$window,history) { //, $http, $filter, Thesaurus


      $scope.toggle = dashMenu.toggle;
      $scope.sections = dashMenu.getMenu('dashboard');
      $scope.sectionsOptions = dashMenu.getMenu('editEventOptions');


      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;

        $scope.isNew=true;
        $scope._id = $route.current.params.id;
        if($scope._id.length>3)$scope.isNew=false;

      }).then(function(){
        if(!$scope.isAuthenticated)
              $window.location.href='https://accounts.cbd.int/signin?returnUrl='+encodeURIComponent($location.absUrl());
      });

      //=======================================================================
      //
      //=======================================================================
      $scope.close = function(){
          history.goBack();
      };
      //=======================================================================
      //
      //=======================================================================
      $scope.prev = history.getPrevPath();
    }
  ]);
});