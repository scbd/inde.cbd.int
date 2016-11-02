define(['app', 'lodash', 'text!views/index.html', 'views/index', 'services/extended-route',  'services/authentication'], function(app, _, rootTemplate) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                          { template:    rootTemplate,  label:'Home',  controllerAs:"indexCtrl", resolveController: 'views/index', reloadOnSearch : false }).
            when('/home',                      { redirectTo: '/' }).
            when('/past',                      { templateUrl: 'views/past.html',  controllerAs:'pastCtrl',    resolveController: true, resolveUser: true }).
            when('/admin',                     { templateUrl: 'views/admin/admin-dash-board.html',            resolveController: true, resolveUser: true,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/admin/events',              { templateUrl: 'views/admin/events.html',                      resolveController: true, resolveUser: true,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/admin/organizations',       { templateUrl: 'views/admin/organizations.html',               resolveController: true, resolveUser: true,reloadOnSearch : false ,resolve : { securized : securize(['Administrator','IndeAdministrator']) } }).
            when('/manage/events',             { templateUrl: 'views/admin/events.html',                     resolveController: true, resolveUser: true ,resolve : { securized : securize(['User','Administrator','IndeAdministrator']) } }).
            when('/manage/events/:id',         { templateUrl: 'views/manage/edit-event.html',                 resolveController: true, resolve : {user : securize(['User','Administrator','IndeAdministrator']) }}).
            when('/manage/organizations',      { templateUrl: 'views/admin/organizations.html',              resolveController: true, resolveUser: true,reloadOnSearch : false,resolve : {user : securize(['User','Administrator','IndeAdministrator']) } }).
            when('/manage/organizations/:id',  { templateUrl: 'views/manage/edit-organization.html',          resolveController: true, resolveUser: true,reloadOnSearch : false,resolve : {user : securize(['User','Administrator','IndeAdministrator']) }  }).
            when('/manage',                    { templateUrl: 'views/manage/dash-board.html',                 resolveController: true, resolveUser: true,resolve : {user : securize(['User','Administrator','IndeAdministrator']) }}).
            when('/manage/:id',                { templateUrl: 'views/side-event.html',                        controllerAs:"sideEventCtrl", resolveController: true, resolveUser: true}).
            when('/:id',                       { templateUrl: 'views/side-event.html',                        controllerAs:"sideEventCtrl", resolveController: true, resolveUser: true}).
            when('/404',                       { templateUrl: 'views/404.html',                               resolveUser: true }).
            otherwise({ redirectTo: '/404' });
    }]);


    //============================================================
    //
    //
    //============================================================
    function securize(roles) {

        return ['$location', '$window', '$q','authentication','devRouter', function ($location, $window, $q, authentication,devRouter) {

            return authentication.getUser().then(function (user) {

                if (!user.isAuthenticated) {
                    var returnUrl = $window.encodeURIComponent($window.location.href);
                    $window.location.href = devRouter.ACCOUNTS_URI+'/signin?returnUrl=' + returnUrl; // force sign in
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