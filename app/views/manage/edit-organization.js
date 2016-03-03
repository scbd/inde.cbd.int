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


  app.controller("edit-organization", ['$scope', 'dashMenu', '$q', '$http','$filter','$route','mongoStorage','$location','authentication', //"$http", "$filter", "Thesaurus",
    function($scope, dashMenu, $q, $http,$filter,$route,mongoStorage,$location,authentication) { //, $http, $filter, Thesaurus

      $scope.loading=false;
      $scope.schema="inde-orgs";

      $scope.toggle = dashMenu.toggle;
      $scope.sections = dashMenu.getMenu('dashboard');

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
      }).then(function(){
        if(!$scope.isAuthenticated)
          $('#loginDialog').modal('show');
      });
    }
  ]);
});