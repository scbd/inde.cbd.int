define(['app', 'lodash',

// '../../directives/side-menu/scbd-side-menu',
'./menu',
'../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("dashBoard", ['$scope','dashMenu','authentication','$location','$timeout','mongoStorage','$window', //"$http", "$filter", "Thesaurus",
     function($scope,dashMenu,authentication,$location,$timeout,mongoStorage,$window) { //, $http, $filter, Thesaurus
      $scope.test=[];


      $scope.toggle = dashMenu.toggle;
      $scope.sections = dashMenu.getMenu('dashboard');
      $scope.facets={};
      $scope.facets.all=0;
      $scope.facets.drafts=0;
      $scope.facets.requests=0;
      $scope.facets.published=0;
      $scope.facets.canceled=0;
      $scope.facets.rejected=0;
      $scope.facets.archived=0;
      $scope.facetsO={};
      $scope.facetsO.all=0;
      $scope.facetsO.drafts=0;
      $scope.facetsO.requests=0;
      $scope.facetsO.published=0;
      $scope.facetsO.canceled=0;
      $scope.facetsO.rejected=0;
      $scope.facetsO.archived=0;
      var statuses=['draft','published','request','canceled','rejected','archived'];
      mongoStorage.getOwnerFacits('inde-side-events',$scope.facets,statuses);
      mongoStorage.getOwnerFacits('inde-orgs',$scope.facetsO,statuses)

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
      }).then(function(){
        if(!$scope.isAuthenticated)
          $('#loginDialog').modal('show');
      });

      //=======================================================================
      //
      //=======================================================================
      $scope.goTo = function (url){
        $location.url(url);
      }// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.close = function(){

          $window.history.back();
      };
    }]);
});
