define(['app', 'text!./bs-progress-bar.html'], function(app,template) {
    'use strict';
    app.directive("bsProgressBar", [ function() {
        return {
            restrict: "EA",
            template: template,
            scope: {
                total: '=total',
                complete: '=complete',
                barClass: '@barClass',
                completedClass: '=?',
                steps: '=?'
            },
            transclude: true,
            link: function(scope, $element, attrs) {

                scope.label = attrs.label;
                scope.completeLabel = attrs.completeLabel;
                scope.showPercent = (attrs.showPercent) || false;
                scope.completedClass = (scope.completedClass) || 'progress-bar-danger';

                scope.$watch('complete', function() {

                    //change style at 100%
                    var progress = scope.complete / scope.total;
                    if (progress >= 1) {
                        $element.find('.progress-bar').addClass(scope.completedClass);
                    } else if (progress < 1) {
                        $element.find('.progress-bar').removeClass(scope.completedClass);
                    }

                });

            },

        };
    }]);
});