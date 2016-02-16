define(['app', 'lodash',
'scbd-branding/side-menu/scbd-side-menu',
'scbd-branding/side-menu/scbd-menu-service',
'scbd-angularjs-controls'], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

    app.controller("dashBoard", ['$scope','$mdSidenav', '$mdUtil','$mdMedia','$timeout','$log','scbdMenuService', //"$http", "$filter", "Thesaurus",
     function($scope,$mdSidenav,$mdUtil, $mdMedia,$timeout,$log,scbdMenuService) { //, $http, $filter, Thesaurus
       console.log('controller');

      //  $scope.toggleLeft = function (){$mdSidenav('left')
      //      .close()
      //      .then(function(){
      //          console.log.debug("close LEFT is done");
      //      });};



               $scope.toggleLeft = buildDelayedToggler('left');
               $scope.toggleRight = buildToggler('right');
               $scope.isOpenRight = function(){
                 return $mdSidenav('right').isOpen();
               };
               /**
                * Supplies a function that will continue to operate until the
                * time is up.
                */
               function debounce(func, wait, context) {
                 var timer;
                 return function debounced() {
                   var context = $scope,
                       args = Array.prototype.slice.call(arguments);
                   $timeout.cancel(timer);
                   timer = $timeout(function() {
                     timer = undefined;
                     func.apply(context, args);
                   }, wait || 10);
                 };
               }
               /**
                * Build handler to open/close a SideNav; when animation finishes
                * report completion in console
                */
               function buildDelayedToggler(navID) {
                 return debounce(function() {
                   $mdSidenav(navID)
                     .toggle()
                     .then(function () {
                       $log.debug("toggle " + navID + " is done");
                     });
                 }, 200);
               }
               function buildToggler(navID) {
                 return function() {
                   $mdSidenav(navID)
                     .toggle()
                     .then(function () {
                       $log.debug("toggle " + navID + " is done");
                     });
                 }
               }


//        //$scope.toggleRight = buildToggler('right');
//        //**********************************************************
//        $scope.close = function() {
//            $mdSidenav('left').close()
//                .then(function() {
//                    console.log.debug("close LEFT is done");
//                });
//        };
//
//        //**********************************************************
//        function buildToggler(navID) {
// console.log('ssssss');
//          $mdSidenav('left')
//              .close()
//              .then(function(){
//                  console.log.debug("close LEFT is done");
//              });
//           //  var debounceFn = $mdUtil.debounce(function() {
//           //      $mdSidenav(navID)
//           //          .toggle()
//           //          .then(function() {
//           //              console.log("toggle " + navID + " is done");
//           //          });
//           //  }, 300);
//           //  return debounceFn;
//        }

    }]);
});
