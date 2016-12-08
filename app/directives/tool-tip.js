define(['app'],
  function(app) {

    app.directive('toolTip', ['$timeout',function($timeout) {
      return {
        restrict: 'A',
        replace: false,
        transclude: false,

        link: function($scope, $element, $attr) {

          $element.tooltip({ placement: $attr.dataPlacement,
                 content: function() {
                   return $attr.dataOriginalTitle;
                 }
           });

           $element.on('mouseenter', function() {
                 $element.tooltip('show');
                 $timeout(function(){
                    $element.tooltip('hide');
                 },5000);
           });
           $element.on('mouseleave', function() {
                 $element.tooltip('hide');
           });

          } //link
      }; //return
    }]); //directive

  }); //define