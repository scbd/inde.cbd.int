define(['app', 'lodash',
'css!./dash-board',
'scbd-branding/side-menu/scbd-side-menu',
  './menu',
'scbd-angularjs-controls'], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("config", ['$scope','adminMenu','$q','$http', //"$http", "$filter", "Thesaurus",
     function($scope, adminMenu,$q,$http) { //, $http, $filter, Thesaurus

    //  $scope.isLocked=$mdMedia('gt-sm');
    $scope.toggle = adminMenu.toggle;
    $scope.sections = adminMenu.getMenu('admin');

      $q.when( $http.get('/api/v2015/inde-config'))
     .then(function(response){
          $scope.faqSearch = response.data;
console.log(response.data);
        });

    }]);
});
