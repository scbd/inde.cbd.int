define(['app', 'lodash', 'text!./portal-nav.html','css!./portal-nav' ], function (app, _,template) {
app.directive('portalNav', function () {
    return {
    restrict: 'E',
    replace: true,
    template: template,
    scope: {
            uid: '@',
    },
    controller: ['$scope','$location','$window','$timeout','$element','authentication','scbdMedia',
            function ($scope,$location,$window,$timeout,$element,authentication,media) {




              //============================================================
              //
              //============================================================
              $scope.setActivePath = function (){
                  $scope.path=$location.url();

                  if($scope.path==='/')
                    $element.find("#home").addClass('active');
                  else
                    $element.find("#home").removeClass('active');

                  if($scope.path==='/manage/events/0')
                      $element.find("#request").addClass('active');
                  else
                    $element.find("#request").removeClass('active');

                  if($scope.path==='/help')
                      $element.find("#help").addClass('active');
                  else
                    $element.find("#help").removeClass('active');

                  if($scope.path==='/manage/events' || $scope.path==='/manage' || $scope.path==='/manage' )
                      $element.find("#dash").addClass('active');
                  else
                      $element.find("#dash").removeClass('active');

                  if($scope.path==='/admin')
                          $element.find("#admin").addClass('active');
                  else
                          $element.find("#admin").removeClass('active');

              }//isActivePath
$scope.setActivePath ();
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




      }]};//end controller
  });
});
