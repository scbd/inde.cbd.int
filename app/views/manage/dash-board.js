define(['app', '../../services/mongo-storage'], function(app) { //'scbd-services/utilities',
    app.controller("dashBoard", ['$scope',  'authentication', '$location', '$timeout', 'mongoStorage', '$window', 'history', //"$http", "$filter", "Thesaurus",
        function($scope,  authentication, $location, $timeout, mongoStorage, $window, history) { //, $http, $filter, Thesaurus
            $scope.test = [];

            $scope.facets = {};
            $scope.facets.all = 0;
            $scope.facets.drafts = 0;
            $scope.facets.requests = 0;
            $scope.facets.published = 0;
            $scope.facets.canceled = 0;
            $scope.facets.rejected = 0;
            $scope.facets.archived = 0;
            $scope.facetsO = {};
            $scope.facetsO.all = 0;
            $scope.facetsO.drafts = 0;
            $scope.facetsO.requests = 0;
            $scope.facetsO.published = 0;
            $scope.facetsO.canceled = 0;
            $scope.facetsO.rejected = 0;
            $scope.facetsO.archived = 0;
            var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
            mongoStorage.getOwnerFacits('inde-side-events', $scope.facets, statuses);
            mongoStorage.getOwnerFacits('inde-orgs', $scope.facetsO, statuses);


            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(path, search, count) {
                if (count)
                    $location.path(path).search(search);
            }; // archiveOrg

            // //=======================================================================
            // //
            // //=======================================================================
            // $scope.goTo = function (url){
            //   $location.url(url);
            // }// archiveOrg

            //============================================================
            //
            //============================================================
            $scope.onError = function(res) {

                $scope.status = "error";
                if (res.status === -1) {
                    $scope.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                    if (res.data.message)
                        $scope.error += " Message Detail: " + res.data.message;
                }
                if (res.status == "notAuthorized") {
                    $scope.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                    if (res.data.message)
                        $scope.error += " Message Detail: " + res.data.message;
                } else if (res.status == 404) {
                    $scope.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                    if (res.data.message)
                        $scope.error += " Message Detail: " + res.data.message;
                } else if (res.status == 500) {
                    $scope.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                    if (res.data.message)
                        $scope.error += " Message Detail: " + res.data.message;
                } else if (res.status == "badSchema") {
                    $scope.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
                } else if (res.data.Message)
                    $scope.error = res.data.Message;
                else
                    $scope.error = res.data;
            };

            //============================================================
            //
            //============================================================
            $scope.hasError = function() {
                return !!$scope.error;
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.close = function() {

                history.goBack();
            };
        }
    ]);
});