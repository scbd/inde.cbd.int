define(['app','lodash'], function(app,_) {
  'use strict';

  app.directive('sorter',['$timeout', function() {
  return {
   restrict: 'E',
   scope:{binding:'=ngModel', direction:'=?direction'},
   template:'<span ng-click="setSort()" ><a ><label style="cursor:pointer;"> {{name}} </label></a> <a ng-if="isSelected()" style="cursor:pointer;"><span><i ng-show="getDirection()"  class="fa fa-caret-down"></i><i ng-show="!getDirection()" class="fa fa-caret-up"></i></a></span></span>',
   link: function($scope,$element,$attrs) {

        $scope.name=$attrs.labelName;
        $scope.property=$attrs.property;
        isSelected();        //inits to selected if object set

        //============================================================
        //
        //============================================================
        $scope.setSort =  function (){
          if(typeof $scope.direction === 'undefined')
            $scope.direction=1;

          if(($attrs.source && $attrs.source==='mongo') || !$attrs.source)
              $scope.direction=-$scope.direction;

          if($attrs.source && $attrs.source==='angular'){
              $scope.direction=!$scope.direction;
          }

          if($attrs.source && $attrs.source==='solr'){
              if($scope.direction)
                  $scope.direction='ASC';
              else
                  $scope.direction='DESC';
          }

          $scope.binding={};
          $scope.binding[$scope.property]=$scope.direction;
        };

        //============================================================
        //
        //============================================================
        function getDirection() {
          if(($attrs.source && $attrs.source==='mongo') || !$attrs.source){
              if($scope.direction > 0) return true;
              else return false;
          }
          if($attrs.source && $attrs.source==='angular'){
              if($scope.direction) return true;
              else return false;
          }

          if($attrs.source && $attrs.source==='solr'){
              if($scope.direction ==='ASC')
                  return true;
              else
                  return false;
          }
        }
        $scope.getDirection=getDirection;

        //============================================================
        //
        //============================================================
        function isSelected() {

          if(!_.isObject($scope.binding)) return false;

          return (Object.keys($scope.binding)[0] === $attrs.property);
        }
        $scope.isSelected=isSelected;


     }
    };
  }]);
}); // define
