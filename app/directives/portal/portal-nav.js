define(['app', 'lodash', 'text!./portal-nav.html','css!./portal-nav' ], function (app, _,template) {
app.directive('portalNav', function () {
    return {
    restrict: 'E',
    replace: true,
    template: template,
    scope: {
            uid: '@',
    },
    controller: ['$scope','$location','$window','$timeout','$element','authentication',
            function ($scope,$location,$window,$timeout,$element,authentication) {


              $scope.isOpen = false;
               $scope.demo = {
                 isOpen: false,
                 count: 0,
                 selectedDirection: 'left'
               };

              var lastScrolY=0;
              angular.element($window).bind(
              	"scroll", function(e) {
                       //console.log('window.pageYOffset',e.originalEvent);
                       if(window.pageYOffset > lastScrolY) {
                         $scope.portalMobiNavClass = 'portal-nav-mobi-small';
                         $scope.spaceFillClass='space-filler-small';
                       } else {
                         $scope.portalMobiNavClass = 'portal-nav-mobi-big ';
                         $scope.spaceFillClass='space-filler-big';
                       }
                       //console.log('lastScrolY',lastScrolY);
                       lastScrolY=window.pageYOffset;

                       $scope.$apply();
                 });

      $scope.$root.pageTitle = { text: "" };
      $scope.goTo = function(path){
          return $location.url(path);
      };

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
        $scope.isAdmin=(_.intersection(['Administrator','IndeAdministrator'], user.roles).length>0);
      });

      angular.element($window).on('resize',setMedia);

      function setMedia(){

        $timeout(function(){

          $scope.isXs = ($window.innerWidth < 600);
          $scope.isGtXs = ($window.innerWidth >= 600);
          $scope.isSm = (600 <= $window.innerWidth < 960);
          $scope.isGtSm = ($window.innerWidth >= 960);
          $scope.isMd = (960 <= $window.innerWidth < 1280);
          $scope.isGtMd = ($window.innerWidth >= 1280);
          $scope.isLg = (1280 <= $window.innerWidth < 1920 );
          $scope.isGtLg = ($window.innerWidth >= 1920);
        });

      }
      setMedia();

      }]};//end controller
  });
});
