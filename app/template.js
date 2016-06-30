define(['app', 'jquery',
    'lodash',
    'services/authentication',
    'directives/portal/portal-nav',
    'services/history'
], function(app, $, _) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication', 'realm', '$q', function($scope, $rootScope, $window, $location, authentication, realm, $q) {


        $q.when(authentication.getUser()).then(function(u) {
            $rootScope.user = u;
        });

        $scope.$on("$routeChangeSuccess", function(evt, current) {
            $("head > title").text(current.$$route.label || "Side Event Registration");
        });

        $rootScope.$on('event:auth-emailVerification', function(evt, data) {
            $scope.showEmailVerificationMessage = data.message;
        });

        $scope.auth=authentication;
        //============================================================
        //
        //
        //============================================================
        $rootScope.$watch('user', _.debounce(function(user) {

            if (!user)
                return;

            require(["_slaask"], function(_slaask) {

                if (user.isAuthenticated) {
                    _slaask.identify(user.name, {
                        'user-id': user.userID,
                        'name': user.name,
                        'email': user.email,
                    });

                    if (_slaask.initialized) {
                        _slaask.slaaskSendUserInfos();
                    }
                }

                if (!_slaask.initialized) {
                    _slaask.init('ae83e21f01860758210a799872e12ac4');
                    _slaask.initialized = true;
                }
            });
        }, 1000));

    }]);
});