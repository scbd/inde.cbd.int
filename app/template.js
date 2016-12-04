define(['app', 'jquery',
    'lodash',
    'text!./toast.html',
    'toastr',
    'services/authentication',
    'directives/portal/portal-nav',
    'services/history',
    'services/dev-router',
    'services/mongo-storage'
], function(app, $, _, toastTemplate) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication', '$q', 'toastr', '$templateCache','devRouter', function($scope, $rootScope, $window, $location, authentication, $q, toastr, $templateCache,devRouter) {
        $scope.routeLoaded=false;
        $scope.ACCOUNTS_URI=devRouter.ACCOUNTS_URI;
        $q.when(authentication.getUser()).then(function(u) {
            $rootScope.user = u;
        });

        $scope.$on("$routeChangeSuccess", function(evt, current) {
          if(current.$$route)
            $("head > title").text(current.$$route.label || "Side Event Registration");

          $scope.routeLoaded=true;
        });

        $rootScope.$on('event:auth-emailVerification', function(evt, data) {
            $scope.showEmailVerificationMessage = data.message;
        });

        $scope.auth = authentication;
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

        $templateCache.put("directives/toast/toast.html", toastTemplate);


        //==============================
        //
        //==============================
        $rootScope.$on("showInfo", function(evt, msg) {
          console.log('test');
            toastr.info(msg);
        });

        //==============================
        //
        //==============================
        $rootScope.$on("showWarning", function(evt, msg) {
            toastr.warning(msg);
        });

        //==============================
        //
        //==============================
        $rootScope.$on("showSuccess", function(evt, msg) {
            toastr.success(msg);
        });

        //==============================
        //
        //==============================
        $rootScope.$on("showError", function(evt, msg) {
            toastr.error(msg);
        });

    }]);
});