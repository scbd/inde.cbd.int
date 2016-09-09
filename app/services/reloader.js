define(['app'], function(app) {
    'use strict';
    app.factory('reloader', function($route,$routeParams) {
        return {
            preventReload: function($scope, navigateCallback) {
                var lastRoute = $route.current;

                $scope.$on('$locationChangeSuccess', function() {
                    if (lastRoute.$$route.templateUrl === $route.current.$$route.templateUrl) {
                        var routeParams = angular.copy($route.current.params);
                        $route.current = lastRoute;
                        navigateCallback(routeParams);
                    }
                });
            }
        };
    });
});