
define(['app',
 'text!./menu-toggle.html',
 'lodash',
  'css!./menu-toggle',
  'scbd-angularjs-services/authentication'
],
function(app,template,_) {
        app.directive('menuToggle', ['authentication',function (auth ) {
      return {
          scope: {
            section: '=',
            user:'=?'
          },
          template: template,
          require: ['^scbdSideMenu','^menuToggle'],
          controller: ['$scope','$element',function ($scope,$element) {

  //             auth.getUser().then(function(user){
  //
  //               $scope.user = user;
  // //              console.log($scope.user);
  //             });

              // set initial style for link Item
              $element.find('button').addClass($scope.section.config.colorClass);

              $scope.isOpen = function () {
                return $scope.section.open;
              };
              $scope.toggle = function () {

                  $scope.scbdMenuCtrl.closeAllToggles($scope.section.name);
                  $scope.section.open=!$scope.section.open;

              };

              //============================================================
              //
              //
              //============================================================
              $scope.hasRole = function () {

                  if(!$scope.section.roles)
                    return true;
                  else if(!$scope.user)
                    return false;
                  else{
                        return _.intersection($scope.section.roles, $scope.user.roles).length>0;

                  }
              };//hasRole

          }],//cotrroller
          link: function($scope, $element, $attr, ctrls) {

                $scope.scbdMenuCtrl=ctrls[0];
                $scope.section.self=ctrls[1];
          }//link
      };//return
    }]);//directive
});//define