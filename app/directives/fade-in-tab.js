define(['app', 'services/browser-detect'], function(app) {
    'use strict';

    app.directive('fadeInTab', ['browserDetect', function(browserDetect) {
        return {
            restrict: 'A',
            controller: function($scope, $element) {

                if (browserDetect.detect() === 'chrome')
                    $element.addClass('fade in');
            }
        }; // return
    }]); //app.directive('searchFilterCountries
}); // define