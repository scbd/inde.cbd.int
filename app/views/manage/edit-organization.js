define(['app', 'lodash',
  'css!./organizations',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  'scbd-branding/side-menu/scbd-menu-service',
  '../../directives/scbd-localizer',
  '../../directives/forms/edit/edit-organization',
    'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',


  app.controller("edit-organization", ['$scope', 'scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location', //"$http", "$filter", "Thesaurus",
    function($scope, scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location) { //, $http, $filter, Thesaurus

      $scope.loading=false;
      $scope.schema="inde-orgs";

      $scope.toggle = scbdMenuService.toggle;
      $scope.dashboard = scbdMenuService.dashboard;

    }
  ]);
});