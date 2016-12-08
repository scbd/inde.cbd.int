define(['text!./share.html', 'app','720kb.socialshare',    'directives/tool-tip',  ], function(template, app) {
    'use strict';
    app.directive('share', ['$timeout',function($timeout) {
        return {
            restrict: 'E',
            template: template,
            scope: {
                doc:'=',
            },

            controller: ['$scope', function($scope) {
                function getPageCount(){
                  return Math.ceil($scope.count/5);
                }
                $scope.getPageCount =getPageCount;

                $scope.reload=function(){
                  $timeout(function(){
                      $scope.onPage({pageIndex:0});
                  });
                };
            }],
        }; // return
    }]);
}); // define