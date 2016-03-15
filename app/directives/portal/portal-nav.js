define(['app', 'lodash', 'text!./portal-nav.html', 'css!./portal-nav'], function(app, _, template) {
  app.directive('portalNav', function() {
    return {
      restrict: 'E',
      replace: true,
      template: template,
      scope: {
        uid: '@',
      },
      controller: ['$scope', '$location', '$window', '$timeout', '$element', 'authentication', 'scbdMedia',
        function($scope, $location, $window, $timeout, $element, authentication, media) {

          //============================================================
          //
          //============================================================
          $scope.setActivePath = function() {
                $scope.path = $location.url();

                $element.find("#home").removeClass('active');
                $element.find("#home-sm").removeClass('active');
                $element.find("#request").removeClass('active');
                $element.find("#request-sm").removeClass('active');
                $element.find("#admin").removeClass('active');
                $element.find("#admin-sm").removeClass('active');
                $element.find("#dash").removeClass('active');
                $element.find("#dash-sm").removeClass('active');

              if ($scope.path === '/'){
                $element.find("#home").addClass('active');
                $element.find("#home-sm").addClass('active');
              }
              else{
                $element.find("#home").removeClass('active');
                $element.find("#home-sm").removeClass('active');
              }



              if ($scope.path === '/manage/events/0' || $scope.path === '/manage/events/new'){

                  $element.find("#request").addClass('active');
                  $element.find("#request-sm").addClass('active');
              }
              else{
                $element.find("#request").removeClass('active');
                $element.find("#request-sm").removeClass('active');
                    if ($scope.path.indexOf('/manage') > -1 ){
                      $element.find("#dash").addClass('active');
                      $element.find("#dash-sm").addClass('active');

                    }
                    else{
                      $element.find("#dash").removeClass('active');
                      $element.find("#dash-sm").removeClass('active');
                    }
              }

              if ($scope.path.indexOf('/admin') > -1){
                $element.find("#admin").addClass('active');
                $element.find("#admin-sm").addClass('active');
              }
              else{
                  $element.find("#admin").removeClass('active');
                  $element.find("#admin-sm").removeClass('active');
              }

            } //isActivePath

          $timeout(function(){$scope.setActivePath()},1000);

          // $scope.isOpen = false;
          //  $scope.demo = {
          //    isOpen: false,
          //    count: 0,
          //    selectedDirection: 'left'
          //  };

          var lastScrolY = 0;
          //hiding mobi menu needs work
          // angular.element($window).bind(
          // 	"scroll", function(e) {
          //          //console.log('window.pageYOffset',e.originalEvent);
          //          if(window.pageYOffset > lastScrolY) {
          //            $scope.portalMobiNavClass = 'portal-nav-mobi-small';
          //            $scope.spaceFillClass='space-filler-small';
          //          } else {
          //            $scope.portalMobiNavClass = 'portal-nav-mobi-big ';
          //            $scope.spaceFillClass='space-filler-big';
          //          }
          //          //console.log('lastScrolY',lastScrolY);
          //          lastScrolY=window.pageYOffset;
          //
          //          $scope.$apply();
          //    });

          //$scope.$root.pageTitle = { text: "" };
          $scope.goTo = function(path) {
            return $location.url(path);
          };

          authentication.getUser().then(function(user) {
            $scope.isAuthenticated = user.isAuthenticated;
            $scope.isAdmin = (_.intersection(['Administrator', 'IndeAdministrator'], user.roles).length > 0);
          });


        }
      ]
    }; //end controller
  });
});