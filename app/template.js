define(['app','angular', 'jquery',
    'text!./toast.html',
    'toastr',
    'services/authentication',
    'directives/portal/portal-nav',
    'services/history',
    'services/dev-router',
    'services/mongo-storage'
], function(app, ng,$, _, toastTemplate) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication', '$q', 'toastr', '$templateCache','devRouter', function($scope, $rootScope, $window, $location, authentication, $q, toastr, $templateCache,devRouter) {
        var searchParams = new URL(location).searchParams
        $scope.viewOnly = searchParams.get('viewOnly') || searchParams.get('view-only') || false

        $scope.routeLoaded=false;
        $scope.ACCOUNTS_URI=devRouter.ACCOUNTS_URI;
        $q.when(authentication.getUser()).then(function(u) {
            $rootScope.user = u;
        });

        var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');
        $scope.$on("$routeChangeSuccess", function(evt, current) {
          if(current.$$route)
            $("head > title").text(current.$$route.label || "Side Event Registration");

          $scope.routeLoaded=true;
          $window.ga('set',  'page', basePath+$location.path());
          $window.ga('send', 'pageview');
        });

        $rootScope.$on('event:auth-emailVerification', function(evt, data) {
            $scope.showEmailVerificationMessage = data.message;
        });

        $scope.auth = authentication;
        //============================================================
        //
        //
        //============================================================
        var killWatch = $rootScope.$watch('user', function(user) {

            if (!user)
                return;
            if($scope.viewOnly)
              return killWatch();

            require(["https://www.cbd.int/app/js/slaask.js"], function(_slaask) {

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
                    killWatch();
                }
            });
        });

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