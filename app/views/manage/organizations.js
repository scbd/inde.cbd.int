define(['app', 'lodash',
'css!./organizations',
'scbd-branding/side-menu/scbd-side-menu',
'scbd-branding/side-menu/scbd-menu-service',
'scbd-angularjs-controls'], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("organizations", ['$scope','scbdMenuService','$q','$http', //"$http", "$filter", "Thesaurus",
     function($scope,scbdMenuService,$q,$http) { //, $http, $filter, Thesaurus

    //  $scope.isLocked=$mdMedia('gt-sm');
    $scope.toggle=scbdMenuService.toggle;
    $scope.dashboard=scbdMenuService.dashboard;
    console.log('scbdMenuService',scbdMenuService);

//       $q.when( $http.get('/api/v2015/inde-orgs'))
//      .then(function(response){
//           $scope.faqSearch = response.data;
// console.log(response.data);
//         });
$scope.organization={};
$scope.organization.facebook="ddd";
$scope.organization.title="ddd";
// $scope.$watch('organization',function(){console.log($scope.organizationForm.title.$error);},true);

    }]);
});
