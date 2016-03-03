define(['app', 'lodash',
'css!./admin-dash-board',
'scbd-branding/side-menu/scbd-side-menu',
  './menu',
'scbd-branding/scbd-button',
'scbd-branding/scbd-icon-button',
'scbd-angularjs-controls',
'../../directives/forms/controls/scbd-select-list',
'../../directives/scbd-tip'

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("adminDashBoard", ['$scope','adminMenu', //"$http", "$filter", "Thesaurus",
     function($scope,adminMenu) { //, $http, $filter, Thesaurus
      $scope.test=[];
      $scope.$watch('test',function(){console.log('watch in dash',$scope.test);},true);
      $scope.toggle = adminMenu.toggle;
      $scope.sections = adminMenu.getMenu('admin');

    }]);
});
