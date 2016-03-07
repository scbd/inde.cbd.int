define(['app', 'lodash',
  'css!./edit-organization',
    'scbd-branding/side-menu/scbd-side-menu',
  './menu',
  'scbd-branding/scbd-button',
  '../../directives/scbd-localizer',
  '../../directives/forms/edit/edit-organization',
    'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',


  app.controller("edit-organization", ['$scope', 'dashMenu', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$timeout', //"$http", "$filter", "Thesaurus",
    function($scope, dashMenu, $q, $http,$filter,$route,mongoStorage,$location,authentication,$timeout) { //, $http, $filter, Thesaurus

      $scope.loading=false;
      $scope.schema="inde-orgs";

      $scope.toggle = dashMenu.toggle;
      $scope.sections = dashMenu.getMenu('dashboard');
      if(dashMenu.history.length===1)
        $timeout(function(){
              dashMenu.toggle('dashboard');
            $timeout(function(){
              dashMenu.toggle('dashboard');
            },500);
        },500);

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
      }).then(function(){
        if(!$scope.isAuthenticated)
          $('#loginDialog').modal('show');
      });
    }
  ]);
});