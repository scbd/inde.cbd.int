define(['app', 'lodash',
'css!./dash-board',
'scbd-branding/side-menu/scbd-side-menu',
'scbd-branding/side-menu/scbd-menu-service',
'scbd-angularjs-controls'], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("config", ['$scope','scbdMenuService','$q','$http', //"$http", "$filter", "Thesaurus",
     function($scope, scbdMenuService,$q,$http) { //, $http, $filter, Thesaurus

    //  $scope.isLocked=$mdMedia('gt-sm');
      $scope.dashboard=scbdMenuService.dashboard;
      $scope.toggleDashboard=scbdMenuService.toggle('dashboard',$scope);

      $q.when( $http.get('/api/v2015/inde-config'))
     .then(function(response){
          $scope.faqSearch = response.data;
console.log(response.data);
        });

    }]);
});
