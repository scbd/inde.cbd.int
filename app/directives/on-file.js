define(['app'], function(app) {
  'use strict';

  app.directive('onFile', [function() {
    return {
      restrict: 'A',
      scope: {
          onFileChange : "&onFile"
      },
      link: function($scope, $element) {

          if($element.prop("tagName")!="INPUT" || $element.attr("type")!='file')
            return;

          $element.change(function() {
              $scope.$apply(function(){
                  $scope.onFileChange( { files : $element[0].files });
              });
          });
      }
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
