
define(['app'], function(app) {

  app.controller('case-study', ['$scope', '$http','$route',
	function ($scope, $http, $route) {

	 var id = $route.current.params.id;

	 $http.get('/api/v2013/documents').then(function(response) {
			 $scope.documents = response.data;

		 });
  }]);

});