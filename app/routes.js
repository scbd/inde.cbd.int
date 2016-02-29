
define(['app', 'lodash', 'text!views/index.html', 'views/index', 'scbd-angularjs-services/extended-route'], function(app, _, rootTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                   { template:    rootTemplate,  label:'Home',  resolveController: 'views/index', reloadOnSearch : false }).
            when('/home', { redirectTo: '/' }).
            when('/',                     { templateUrl: 'views/index.html',                 resolveController: true, resolveUser: true }).
            when('/about',                { templateUrl: 'views/about.html',                 resolveUser: true }).
            when('/help',                 { templateUrl: 'views/help.html',                  resolveUser: true }).
            when('/manage/events',               { templateUrl: 'views/manage/events.html',                resolveController: true, resolveUser: true }).
            when('/manage/events/:id',            { templateUrl: 'views/manage/edit-event.html',                 resolveController: true, resolveUser: true }).
            when('/manage/organizations', { templateUrl: 'views/manage/organizations.html',        resolveController: true, resolveUser: true,reloadOnSearch : false  }).
            when('/manage/organizations/:id', { templateUrl: 'views/manage/edit-organization.html',        resolveController: true, resolveUser: true,reloadOnSearch : false  }).
            when('/manage',               { templateUrl: 'views/manage/dash-board.html',        resolveController: true, resolveUser: true }).
            when('/manage/config',        { templateUrl: 'views/manage/config.html',        resolveController: true, resolveUser: true, reloadOnSearch : false  }).
            when('/404',                  { templateUrl: 'views/404.html',                   resolveUser: true }).
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