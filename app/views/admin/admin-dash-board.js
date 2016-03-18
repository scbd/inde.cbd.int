define(['app', 'lodash',

  './menu',

'scbd-angularjs-controls',
  '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',


    app.controller("adminDashBoard", ['$scope','adminMenu','authentication','$location','$timeout','mongoStorage','$window', //"$http", "$filter", "Thesaurus",
     function($scope,dashMenu,authentication,$location,$timeout,mongoStorage,$window) { //, $http, $filter, Thesaurus
      $scope.test=[];


      $scope.toggle = dashMenu.toggle;
      $scope.sections = dashMenu.getMenu('admin');
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
      mongoStorage.getStatusFacits('inde-side-events',$scope.facets,statuses);
      mongoStorage.getStatusFacits('inde-orgs',$scope.facetsO,statuses)

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
