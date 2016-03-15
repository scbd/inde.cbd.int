define(['app', 'jquery',
      'css!font-awsome-css',
      'css!app-css',
      'directives/scbd-media',
      'scbd-angularjs-services/authentication',
      'directives/portal/portal-nav',
      'scbd-branding/header/header',
      'scbd-branding/footer'
    ], function(app, $) {
      'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication',  'realm','$q','$timeout', function($scope, $rootScope, $window, $location, authentication,  realm,$q,$timeout) {



        $scope.$root.pageTitle = { text: "" };
        $rootScope.placeholderRecords=[];
          $scope.routeLoaded = false;

        $q.when(authentication.getUser()).then(function(u){
            $scope.user = u;
        });
        $scope.$on('$viewContentLoaded', function(event) {
          $timeout(function(){$scope.routeLoaded = true;},1000);

        });
        $scope.$on("$routeChangeSuccess", function(evt, current){

            $("head > title").text(current.$$route.label || "Side event Registration");
            $scope.path = $location.path();
        });
        $rootScope.$on('event:auth-emailVerification', function(evt, data){
            $scope.showEmailVerificationMessage = data.message;
        });



        $scope.goHome               = function() { $location.path('/'); };
        $scope.currentPath          = function() { return $location.path(); };


        //============================================================
           //
           //
           //============================================================
           $scope.encodedReturnUrl = function () {
               return encodeURIComponent($location.absUrl());
           };

           //============================================================
           //
           //
           //============================================================
           $scope.actionSignin = function () {
               var client_id    = $window.encodeURIComponent('55asz2laxbosdto6dfci0f37vbvdu43yljf8fkjacbq34ln9b09xgpy1ngo8pohd');
               var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/oauth2/callback');
               $window.location.href = 'https://accounts.cbd.int/oauth2/authorize?client_id='+client_id+'&redirect_uri='+redirect_uri+'&scope=all';
           };

           //============================================================
           //
           //
           //============================================================
           $scope.actionSignOut = function () {
               document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
               var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
               $window.location.href = 'https://accounts.cbd.int/signout?redirect_uri='+redirect_uri;
           };

           //============================================================
           //
           //
           //============================================================
           $scope.actionSignup = function () {
               var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
               $window.location.href = 'https://accounts.cbd.int/signup?redirect_uri='+redirect_uri;
           };

           //============================================================
           //
           //
           //============================================================
           $scope.actionPassword = function () {
               var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
               $window.location.href = 'https://accounts.cbd.int/password?redirect_uri='+redirect_uri;
           };

           //============================================================
           //
           //
           //============================================================
           $scope.actionProfile = function () {
               var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
               $window.location.href = 'https://accounts.cbd.int/profile?redirect_uri='+redirect_uri;
           };

     }]);
});
