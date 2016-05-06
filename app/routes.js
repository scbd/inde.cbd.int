
define(['app', 'lodash', 'text!views/index.html', 'views/index', 'scbd-angularjs-services/extended-route',  'scbd-angularjs-services/authentication'], function(app, _, rootTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                          { template:    rootTemplate,  label:'Home',  resolveController: 'views/index', reloadOnSearch : false }).
            when('/home',                      { redirectTo: '/' }).
            when('/',                          { templateUrl: 'views/past.html',                       resolveController: true, resolveUser: true }).

            when('/past',                      { templateUrl: 'views/past.html',  controllerAs:'pastCtrl',                      resolveController: true, resolveUser: true }).

            when('/admin',                     { templateUrl: 'views/admin/admin-dash-board.html',      resolveController: true, resolveUser: true}).
            when('/admin/events',              { templateUrl: 'views/admin/events.html',                resolveController: true, resolveUser: true,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/admin/users',               { templateUrl: 'views/admin/users.html',                 resolveController: true, resolveUser: true,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/admin/organizations',       { templateUrl: 'views/admin/organizations.html',         resolveController: true, resolveUser: true,reloadOnSearch : false ,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/admin/config',              { templateUrl: 'views/admin/config.html',                resolveController: true, resolveUser: true, reloadOnSearch : false,resolve : { securized : securize(['Administrator','IndeAdministrator']) }  }).
            when('/admin/meetings',            { templateUrl: 'views/admin/meetings.html',              resolveController: true, resolveUser: true, reloadOnSearch : false,resolve : { securized : securize(['Administrator','IndeAdministrator']) }  }).
            when('/admin/meetings/:id',        { templateUrl: 'views/admin/edit-meetings.html',         resolveController: true, resolveUser: true, reloadOnSearch : false, resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).

            when('/manage/events',             { templateUrl: 'views/manage/events.html',                resolveController: true, resolveUser: true }).
            when('/manage/events/:id',         { templateUrl: 'views/manage/edit-event.html',            resolveController: true, resolveUser: true }).
            when('/manage/organizations',      { templateUrl: 'views/manage/organizations.html',         resolveController: true, resolveUser: true,reloadOnSearch : false  }).
            when('/manage/organizations/:id',  { templateUrl: 'views/manage/edit-organization.html',     resolveController: true, resolveUser: true,reloadOnSearch : false  }).
            when('/manage',                    { templateUrl: 'views/manage/dash-board.html',            resolveController: true, resolveUser: true}).
            when('/:id',                       { templateUrl: 'views/side-event.html',                  controllerAs:"sideEventCtrl", resolveController: true, resolveUser: true }).
            when('/404',                       { templateUrl: 'views/404.html',                          resolveUser: true }).
            otherwise({ redirectTo: '/404' });
    }]);


    //============================================================
    //
    //
    //============================================================
    function securize(roles) {

        return ['$location', '$window', '$q','authentication', function ($location, $window, $q, authentication) {

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