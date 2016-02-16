define(['app',
        'text!./portal-branding.html',
        'css!./portal-branding',
    ], function(app, template) {
    app.directive('portalBranding', function() {
        return {
            restrict: 'EAC',
            replace: true,
            // transclude: true,
            template: template,
            scope: {
                uid: '@',
            },
            link: ['$scope', '$q', '$element', function($scope, $q, $element) {

            }],
            controller: ['$scope','$location',
                function($scope,$location) {

                    //============================================================
                    //
                    //
                    //============================================================
                    $scope.env_name = "PLEVRA";
                    $scope.production_env = true;
                    $scope.development_env = false;
                    $scope.training_env = false;

                    if ($location.absUrl().toLowerCase().indexOf("://dev-") > 0 || $location.absUrl().toLowerCase().indexOf("localhost:20") > 0) {
                        $scope.development_env = true;
                        $scope.training_env = false;
                        $scope.production_env = false;
                        $scope.env_name = "DEVELOPMENT";
                    }
                    if ($location.absUrl().toLowerCase().indexOf("://training-") > 0) {
                        $scope.development_env = false;
                        $scope.training_env = true;
                        $scope.production_env = false;
                        $scope.env_name = "TRAINING";
                    }

                }
            ]
        };

    });
});
