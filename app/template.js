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
        $scope.routeLoaded=false;
        $scope.ACCOUNTS_URI=devRouter.ACCOUNTS_URI;
        $q.when(authentication.getUser()).then(function(u) {
            $rootScope.user = u;
        });

        this.viewOnly = $rootScope.viewOnly = $location.search().viewOnly;

        var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');
        $scope.$on("$routeChangeSuccess", function(evt, current) {
          if(current.$$route)
            $("head > title").text(current.$$route.label || "Side Event Registration");

          $scope.routeLoaded=true;
          $window.gtag('event', 'page_view', {
            'page_location' : basePath+$location.path()
          });
        });

        $rootScope.$on('event:auth-emailVerification', function(evt, data) {
            $scope.showEmailVerificationMessage = data.message;
        });

        $scope.auth = authentication;

        if(!this.viewOnly)
          $q.when(authentication.getUser()).then(function(user){

              $scope.user = user;

              require(["https://cdn.slaask.com/chat.js"], function(_slaask = window._slaask) {

                  if (user.isAuthenticated) {
                      _slaask.identify(user.name, {
                          'user-id' : user.userID,
                          'name' : user.name,
                          'email' : user.email,
                      });

                      if(_slaask.initialized) {
                          _slaask.slaaskSendUserInfos();
                      }
                  }

                  if(!_slaask.initialized) {
                      _slaask.init('ae83e21f01860758210a799872e12ac4');
              
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
