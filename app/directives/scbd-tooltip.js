
define(['app',
  'lodash',
  'css!./scbd-tooltip',


],
function(app,_) {

    app.directive('scbdTooltip', [ function () {
            return {
              restrict: 'E',
              replace: true,
              transclude: true,
      //<span class="scbd-tt-item">item that will trigger tooltip</span><span class="scbd-tt-content clearfix"> info to be shown</span>
              scope:{active:'='},
              template: '<span class="scbd-tt scbd-tt-grow" ><ng-transclude></ng-transclude></span>',
              link:function ($scope, $element, $attr) {
                var mid = Number($element.width())/2;


              var midContent = Number($element.find('.scbd-tt-content').width())/2;
              var midItem = Number($element.width())/4;
              //if fint-size = 15 +5 offset
              //is font size is 45 -10 offset
              var mid = midContent +2;

              $element.find('.scbd-tt-content').css('left','-'+mid+'px');

                $element.on('mouseenter', function(e) {
// console.log('event',$element.find('.scbd-tt-content').width());
// console.log('event',$element.width());
                           });
                }//link
            };//return
    }]);//directive

});//define