
define(['app',
  'css!./scbd-button',
  './waves'
],
function(app) {
  app.directive('scbdButton', ['$timeout','wavesService', function ($timeout,wavesService ) {
          return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope:{},
            template: ' <button class="scbd-btn"><ng-transclude></ng-transclude></button>',
            link:function ($scope, $element, $attr) {
                wavesService.attach($element, [ 'waves-effect']);
                wavesService.init();

              }//link
          };//return
  }]);//directive

  app.directive('scbdFabButton', ['$timeout','wavesService', function ($timeout,wavesService ) {
          return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope:{},
            template: ' <button class="scbd-btn-floating" ><ng-transclude></ng-transclude></button>',
            link:function ($scope, $element, $attr) {
                wavesService.init();
                wavesService.attach($element, ['waves-effect','waves-circle', 'waves-float', 'waves-light']);
              }//link
          };//return
  }]);//directive


  app.directive('scbdFlatButton', ['$timeout','wavesService','$compile', function ($timeout,wavesService,$compile ) {
          return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope:{backGround:'@',color:'@'},
            template: ' <button type="button" class="scbd-btn-flat" ><ng-transclude></ng-transclude></button>',
            //left:-1px;text-align:left;padding:0 5px 0 5px;
            link:function ($scope, $element, $attr) {
                wavesService.init();
                //if()
                wavesService.attach($element, ['waves-effect']);

                if($attr.active)
                    $element.addClass($attr.active);

                if($attr.activePath)
                    $element.addClass($attr.active);


              }//link
          };//return

  }]);//directive
});//define