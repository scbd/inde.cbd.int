define(['app'], function(app) {
    'use strict';
    app.factory('browserDetect', ['$window', function($window) {

        var userAgent = $window.navigator.userAgent;

        var browsers = {
            chrome: /chrome/i,
            safari: /safari/i,
            firefox: /firefox/i,
            ie: /internet explorer/i
        };

        function detect() {
            for (var key in browsers) {
                if (browsers[key].test(userAgent)) {
                    return key;
                }
            }
            return 'unknown';
        }
        return {
            detect: detect
        };
    }]);
});