define(['app', 'lodash', 'text!./portal-nav.html', 'css!./portal-nav'], function(app, _, template) {
  app.directive('portalNav', function() {
    return {
      restrict: 'E',
      replace: true,
      template: template,
      scope: {
        uid: '@',
      },
      controller: ['$scope', '$location', '$window', '$timeout', '$element', 'authentication','$rootScope','mongoStorage',
        function($scope, $location, $window, $timeout, $element, authentication,$rootScope,mongoStorage) {

          mongoStorage.getLatestConfrences().then(function(res){
              if(_.isEmpty(res.data))
                $scope.hideNavs=true;
          });

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



              if ($scope.path === '/manage/events/0' || $scope.path === '/manage/events/new' || ($scope.path.indexOf('/manage/events/')>-1 && $scope.path.length>18)){

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

            }; //isActivePath

          $timeout(function(){$scope.setActivePath();},1000);


          $scope.goTo = function(path) {
            return $location.url(path);
          };

          authentication.getUser().then(function(user) {
            $scope.isAuthenticated = user.isAuthenticated;
            $scope.isAdmin = (_.intersection(['Administrator', 'IndeAdministrator'], user.roles).length > 0);
          });

          $rootScope.$on('$locationChangeSuccess', function(){
                $scope.setActivePath();
          });
        }
      ]
    }; //end controller
  });
});