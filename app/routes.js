
define(['app', 'lodash', 'text!views/index.html', 'views/index', 'scbd-services/extended-route'], function(app, _, rootTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                   { template:    rootTemplate,  label:'Home',  resolveController: 'views/index', reloadOnSearch : false }).
            when('/home', { redirectTo: '/' }).
            when('/',                   { templateUrl: 'views/index.html',                 resolveController: true, resolveUser: true }).
            when('/about',              { templateUrl: 'views/about.html',                 resolveUser: true }).
            when('/countries',          { templateUrl: 'views/samples/country-index.html', resolveController: true, resolveUser: true }).
            when('/countries/:country', { templateUrl: 'views/samples/country.html',       resolveController: true, resolveUser: true }).
            when('/case-studies',   { templateUrl: 'views/samples/case-study.html',    resolveController: true, resolveUser: true }).
            when('/404',                { templateUrl: 'views/404.html',                   resolveUser: true }).
            otherwise({ redirectTo: '/404' });
    }]);


    //============================================================
    //
    //
    //============================================================
    function securize(roles) {

        return ['$location', '$window', '$q', function ($location, $window, $q, authentication) {

            return authentication.getUser().then(function (user) {

                if (!user.isAuthenticated) {

                    var returnUrl = $window.encodeURIComponent($window.location.href);
                    $window.location.href = 'https://accounts.cbd.int/signin?returnUrl=' + returnUrl; // force sign in
                    return $q(function () {});
                }
                else if (roles && !_.isEmpty(roles) && _.isEmpty(_.intersection(roles, user.roles))) {

                    $location.url('/help/403'); // not authorized
                }

                return user;
            });
        }];
    }

});