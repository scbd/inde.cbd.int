'use strict';

define(['app','lodash' 'extended-route-provider'], function(app,_) {

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                   { templateUrl: '/app/views/index.html',                 resolveController: true, resolveUser: true }).
            when('/about',              { templateUrl: '/app/views/about.html',                 resolveUser: true }).
            when('/countries',          { templateUrl: '/app/views/samples/country-index.html', resolveController: true, resolveUser: true }).
            when('/countries/:country', { templateUrl: '/app/views/samples/country.html',       resolveController: true, resolveUser: true }).
            when('/case-studies/:id',   { templateUrl: '/app/views/samples/case-study.html',    resolveController: true, resolveUser: true }).
            when('/404',                { templateUrl: '/app/views/404.html',                   resolveUser: true }).
            otherwise({ redirectTo: '/404' });
    }]);

    //============================================================
      //
      //
      //============================================================
      function currentUser() {

          return ['authentication', function (authentication) {

              return authentication.getUser();
          }];
      }

      //============================================================
      //
      //
      //============================================================
      function securize(roles) {

          return ['$location', '$window', '$q', 'authentication', function ($location, $window, $q, authentication) {

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