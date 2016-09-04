define(['text!./pagination.html', 'app'], function(template, app) {
    'use strict';
    app.directive('pagination', [function() {
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
                onPage:'&'
            },

            controller: ['$scope', function($scope) {}],
        }; // return
    }]);
}); // define