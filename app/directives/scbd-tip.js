define([ 'app', 'lodash',
'css!./scbd-tip',

], function( app, _,template) { 'use strict';

app.directive('scbdTip', [function () {
	return {
		restrict   : 'A',

		//replace    : true,
		transclude : false,

		link : function($scope, $element, $attrs) {
      $element.css('position','relative');
      $element.append('<div class="tool-tip bottom grow">'+$attrs.scbdTip+'</div>');
    //  console.log($attrs);

          $element.bind('mouseover', function(e) {
var el = $element.find('.tool-tip');
el.addClass('on-focus');
// el.addClass('on-focus');
            //var del angular.element('<div/>');

            // console.log($scope.tipContent);
            // console.log($attrs);
            // console.log(e.target);
          });

					//==================================
					//
					//==================================
					function init () {



					}// init

		      init();
		}
	};
}]);
});
