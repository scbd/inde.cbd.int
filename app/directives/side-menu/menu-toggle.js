
define(['app',
 'text!./menu-toggle.html',
 'lodash',
  'css!./menu-toggle',

],
function(app,template,_) {
        app.directive('menuToggle', ['authentication','$location',function (auth ,$location) {
      return {
          scope: {
            section: '=',
            user:'=?'
          },
          template: template,
          require: ['^scbdSideMenu','^menuToggle'],
          controller: ['$scope','$element',function ($scope,$element) {

              auth.getUser().then(function(user){

                $scope.user = user;
  //              console.log($scope.user);
              });
              var colorClass;
              var activeClass;
              var iconClass;

              colorClass=$scope.section.config.colorClass;
              activeClass = $scope.section.config.activeClass;
              iconClass = $scope.section.config.iconClass;
              // set initial style for link Item
              $element.find('#toggle-button').addClass(colorClass);

              $scope.isOpen = function () {
                return $scope.section.open;
              };
              $scope.toggle = function () {
//console.log($scope.scbdMenuCtrl);
                  $scope.scbdMenuCtrl[0].closeAllToggles($scope.section.name);
                  $scope.section.open=!$scope.section.open;

              };
              //============================================================
              //
              //============================================================
              $element.find('#toggle-button').on('mouseenter', function() {

                    toggleActive();
              });
              //============================================================
              //
              //============================================================
              $element.find('#toggle-button').on('mouseleave', function() {

                   toggleActive();
              });
              //============================================================
              // returns true if the browser locaiton matches the links target locaiton
              //============================================================
              function isActivePath (){
                  return ($scope.section.path===$location.url());
              }//isActivePath
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

              //============================================================
              //
              //============================================================
              function deactivate(){
                 var tb = $element.find('#toggle-button');
                  tb.removeClass(colorClass);
                  tb.removeClass(activeClass);
                  tb.addClass(colorClass);
                  tb.find('i').removeClass(iconClass);
                  tb.find('img').removeClass(iconClass);
                  $scope.section.active=false;
              }// deactive

              //============================================================
              //
              //============================================================
              function activate(){
                var tb = $element.find('#toggle-button');
                  tb.addClass(activeClass);
                  tb.find('i').addClass(iconClass);

                  tb.find('img').addClass(iconClass);
                  $scope.section.active=true;
              }//activate
              //============================================================
              //
              //============================================================
              function toggleActive(){
                 if($element.find('#toggle-button').hasClass(activeClass))
                    deactivate();
                 else
                    activate();
              }//toggleactivate

          }],//cotrroller
          link: function($scope, $element, $attr, ctrls) {

                $scope.scbdMenuCtrl=ctrls;
                $scope.section.self=ctrls[1];
          }//link
      };//return
    }]);//directive
});//define