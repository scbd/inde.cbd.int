define(['app', 'lodash',
  'css!./edit-event',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  './menu',
  '../../directives/scbd-localizer',
  '../../directives/forms/edit/edit-side-event',
    'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',


  app.controller("edit-event", ['$scope', 'dashMenu', '$q', '$http','$filter','$route','mongoStorage','$location','authentication', //"$http", "$filter", "Thesaurus",
    function($scope, dashMenu, $q, $http,$filter,$route,mongoStorage,$location,authentication) { //, $http, $filter, Thesaurus

      $scope.loading=false;
      $scope.schema="inde-side-events";

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