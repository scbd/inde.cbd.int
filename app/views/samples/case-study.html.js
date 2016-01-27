define([], function() {

	return function ($scope, authHttp, $route, $cookies) {

		var id = $route.current.params.id;

		authHttp.get('/api/v2013/documents/'+id).then(function(response) {
	  		$scope.document = response.data;

	  		$scope.$root.pageTitle.text = $scope.document.title.en;
	  	});

	  	// $scope.save = function () {
	  	// 	authHttp.put('/api/v2013/documents/'+id, $scope.document);
	  	// }
		
	};
    
});