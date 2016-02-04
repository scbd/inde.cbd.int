define(['app', 'lodash', 'text!./portal-nav.html','css!./portal-nav','ng-breadcrumbs' ], function (app, _,template) {
app.directive('portalNav', function () {
    return {
    restrict: 'E',
    replace: true,
    template: template,
    scope: {
            uid: '@',
    },
    controller: ['$scope','breadcrumbs',
            function ($scope,breadcrumbs) {

      $scope.breadcrumbs     = breadcrumbs;
      $scope.$root.pageTitle = { text: "" };


      }]};//end controller
  });
});
