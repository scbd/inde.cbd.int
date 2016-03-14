define(['app', 'jquery',
'css!font-awsome-css',
'css!app-css',
'directives/scbd-media',
'scbd-angularjs-services/authentication',
'directives/portal/portal-nav',
'scbd-branding/header/header',
'scbd-branding/footer'], function(app, $) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication',  'realm','$q', function($scope, $rootScope, $window, $location, authentication,  realm,$q) {



        // if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
        //     $window.location = "https://chm.cbd.int/";






        // $scope.test_env        = realm != 'SEP';

        $scope.$root.pageTitle = { text: "" };
        $rootScope.placeholderRecords=[];


        $q.when(authentication.getUser()).then(function(u){
            $scope.user = u;
        });

        $scope.$on("$routeChangeSuccess", function(evt, current){
            $scope.routeLoaded = true;
            $("head > title").text(current.$$route.label || "Side event Registration");
        });

        // $scope.$on("$routeChangeStart", function(e,r){
        //
        //     if(!r.$$route.progress || r.$$route.progress.start!==false)
        //         nprogress.start();
        // });
        //
        // $scope.$on("$routeChangeSuccess", function(e,r){
        //     if(!r.$$route.progress || r.$$route.progress.stop!==false)
        //         nprogress.done();
        // });


        $scope.goHome               = function() { $location.path('/'); };
        $scope.currentPath          = function() { return $location.path(); };
        // $scope.hideSubmitInfoButton = function() { return $location.path()=="/management/register"; };

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
