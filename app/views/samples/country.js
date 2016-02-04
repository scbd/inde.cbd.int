define([], function() {

  	return ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

		$http.get('/api/v2013/countries/' + $routeParams.country).then(function(response) {
        	$scope.country = response.data;
      	});
      	
    }];
});