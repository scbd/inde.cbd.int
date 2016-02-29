define(['app'], function(app) {


  app.directive('scbdLocalizer', ['locale','$compile', function(locale,$compile) {
    return {
      template:'<span>{{localized}}</span>',
      restrict: 'E',
      scope:{value:"="},
      link: function($scope, $element, $attr) {
          var defaultLocale='en';
          $scope.localized=0;

          if(!$scope.value){
            $element.attr('ng-if', 0);
            $compile($element)($scope);
          }else{
              if($scope.value[locale])
                  $scope.localized=$scope.value[locale];
              else if($scope.value[defaultLocale])
                  $scope.localized=$scope.value[defaultLocale];
              else
                _.each($scope.value,function(value,key){
                      if(key && !$scope.localized) $scope.localized=$scope.value[key];
                });
          }



      } //end controller
    }; // return
  }]);



});