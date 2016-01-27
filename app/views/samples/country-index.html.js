define([], function() {

    return ['$scope', '$http', function ($scope, $http) {

		$http.get('/api/v2013/countries').then(function(response) {
        	$scope.countries = response.data;
        });

    }];
});