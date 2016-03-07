define(['app', 'lodash',
'css!./dash-board',
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

    app.controller("dashBoard", ['$scope','dashMenu','authentication','$location','$timeout', //"$http", "$filter", "Thesaurus",
     function($scope,dashMenu,authentication,$location,$timeout) { //, $http, $filter, Thesaurus
      $scope.test=[];


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


    }]);
});
