define(['app', 'lodash',  'services/mongo-storage','directives/mobi-menu'], function(app, _) {


    app.controller("adminDashBoard", ['$scope',  '$location', 'mongoStorage',  'history','$timeout',
        function($scope,  $location,  mongoStorage,  history,$timeout) {

            var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];

            init();

            //=======================================================================
            //
            //=======================================================================
            function init() {
                mongoStorage.getStatusFacits('inde-side-events', statuses).then(
                    function(data) {
                        $scope.facets = data;
                    }
                );

                $scope.facets = mongoStorage.getStatusFacits('inde-orgs', statuses).then(
                    function(data) {
                        $scope.facetsO = data;
                    }
                );
            } //init
            //=======================================================================
            //
            //=======================================================================
            $scope.refreshSE = function() {
              $scope.refreshingSE=true;
              mongoStorage.getStatusFacits('inde-side-events', statuses, '',true).then(
                  function(data) {
                      $scope.facets = data;
                      $timeout(function(){$scope.refreshingSE=false;},500);
                  }
              );

            }; // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            $scope.refreshORG = function() {
              $scope.refreshingORG=true;
              mongoStorage.getStatusFacits('inde-orgs', statuses, '',true).then(
                  function(data) {
                      $scope.facetsO = data;
                        $timeout(function(){$scope.refreshingORG=false;},500);
                  }
              );
            }; // archiveOrg
            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(path, search, count) {
                if (count)
                    $location.path(path).search(search);
            }; // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            $scope.close = function() {
                history.goBack();
            };

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
                } else  if (res.data && res.data.Message)
                    $scope.error = res.data.Message;
                else
                    $scope.error = res.data || res;
            };
            //============================================================
            //
            //============================================================
            $scope.hasError = function() {
                return !!$scope.error;
            };


        }
    ]);
});