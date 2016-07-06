define(['app',
  'directives/forms/edit/edit-side-event',
    'services/mongo-storage'
], function(app) {


  app.controller("edit-event", ['$scope', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$timeout','$window','history', //"$http", "$filter", "Thesaurus",
    function($scope,  $q, $http,$filter,$route,mongoStorage,$location,authentication,$timeout,$window,history) { //, $http, $filter, Thesaurus



      $scope.isNew=true;
      $scope._id = $route.current.params.id;
      if($scope._id.length>3)$scope.isNew=false;

    

      //=======================================================================
      //
      //=======================================================================
      $scope.close = function(){
          history.goBack();
      };
      //=======================================================================
      //
      //=======================================================================
      $scope.prev = history.getPrevPath();
    }
  ]);
});