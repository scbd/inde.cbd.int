define(['text!./pagination.html', 'app'], function(template, app) {
    'use strict';
    app.directive('pagination', ['$timeout',function($timeout) {
        return {
            restrict: 'E',
            template: template,
            scope: {
                currentPage:'=',
                itemsPerPage:'=',
                filtered :'=',
                search :'=',
                pages   :'=',
                count:'=',
                onPage:'&',

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