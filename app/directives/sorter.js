define(['app'], function(app) {
  'use strict';

  app.directive('sorter',['$timeout', function($timeout) {
  return {
   restrict: 'E',
   scope:{binding:'=ngModel'},
   template:'<span ng-click="setSort()" ><a ><label style="cursor:pointer;"> {{name}}:</label></a> <a ng-if="direction && isSelected()" style="cursor:pointer;"><span><i ng-if="direction===1 && isSelected()"  class="fa fa-caret-down"></i><i ng-if="direction===-1" class="fa fa-caret-up"></i></a></span></span>',
   link: function($scope,$element,$attrs) {

        $scope.name=$attrs.labelName;
        $scope.property=$attrs.property;
        isSelected();        //inits to selected if object set

        //============================================================
        //
        //============================================================
        $scope.setSort =  function (){
          if(!$scope.direction)
            $scope.direction=1;
          else
          $scope.direction=-$scope.direction;
          $scope.binding={};
          $scope.binding[$scope.property]=$scope.direction;
        };

        //============================================================
        //
        //============================================================
        function isSelected() {
            if(!!$scope.binding[$scope.property] && !$scope.direction)
              $scope.direction=$scope.binding[$scope.property];
          return !!$scope.binding[$scope.property];
        }
        $scope.isSelected=isSelected;


     }
    };
  }]);
}); // define
