define(['app', 'lodash',
'css!./dash-board',
'scbd-branding/side-menu/scbd-side-menu',
'scbd-branding/side-menu/scbd-menu-service',
'scbd-branding/scbd-button',
'scbd-branding/scbd-icon-button',
'scbd-angularjs-controls',
'../../directives/forms/controls/scbd-select-list'

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("dashBoard", ['$scope','scbdMenuService', //"$http", "$filter", "Thesaurus",
     function($scope,scbdMenuService) { //, $http, $filter, Thesaurus
      $scope.test=[];
      $scope.$watch('test',function(){console.log('watch in dash',$scope.test);},true);
      $scope.toggle=scbdMenuService.toggle;
      $scope.dashboard=scbdMenuService.dashboard;


    }]);
});
