define(['app', 'jquery',
'css!outdated-browser-css',
'css!font-awsome-css',
'css!app-css',
'css!/app/libs/angular-material/angular-material.min',
//'css!libs/angular-loading-bar/src/loading-bar',
'ng-breadcrumbs',
'scbd-services/authentication',
'directives/portal-branding',
'directives/portal-nav',
'scbd-branding/header/header',
'scbd-branding/footer'], function(app, $) {
    'use strict';

    app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$location', 'authentication',  'realm', function($scope, $rootScope, $window, $location, authentication,  realm) {

        if ($location.protocol() == "http" && $location.host() == "chm.cbd.int")
            $window.location = "https://chm.cbd.int/";

        $scope.test_env        = realm != 'SEP';

        $scope.$root.pageTitle = { text: "" };
        $rootScope.placeholderRecords=[];

        $scope.$on("$routeChangeSuccess", function(evt, current){
            $scope.routeLoaded = true;
            $("head > title").text(current.$$route.label || "Plevra (Side event Registration)");
        });


        // //========================================
        // //
        // //========================================
        // $scope.doSearch = function () {
        //     $location.url('/database/').search('q', $scope.searchQuery);
        //     $scope.searchQuery = '';
        // };


        $scope.goHome               = function() { $location.path('/'); };
        $scope.currentPath          = function() { return $location.path(); };
        $scope.hideSubmitInfoButton = function() { return $location.path()=="/management/register"; };

        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////






        // $scope.showSimpleToast = function(msg)
        // {
        //     $mdToast.show(
        //       $mdToast.simple()
        //         .content(msg)
        //         .position('top right')
        //         .hideDelay(3000)
        //     );
        //
        //
        // }

        // $scope.showToastConfirmReload = function(msg)
        // {
        //     var toast = $mdToast.simple()
        //           .content(msg)
        //           .action('Refresh List')
        //           .highlightAction(false)
        //           .position('top right')
        //           .hideDelay(20000);
        //
        //     $mdToast.show(toast).then(function() {
        //         $scope.$broadcast("RefreshList");
        //     });
        //
        // }


        // //======================================================
        // //
        // //
        // //======================================================
        // $rootScope.$on("ProcessingRecord", function(evt, recID, schema) {
        //     $rootScope.placeholderRecords.push({'recID':recID,'schema':schema});
        // });

     }]);
});
