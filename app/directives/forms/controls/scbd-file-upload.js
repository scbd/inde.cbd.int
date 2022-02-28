define(['app', 'lodash', 'text!./scbd-file-upload.html','filters/l-string','services/filters','ngFileUpload'], function(app, _, template) {
    'use strict';
    app.directive('scbdFileUpload', ["$http", "Upload", "$timeout", 'mongoStorage','$sce','devRouter', function($http, Upload, $timeout, mongoStorage,$sce,devRouter) {
        return {
            restrict: 'E',
            template: template,
            transclude: false,
            scope: {
                binding: "=ngModal",
                pattern: "=?pattern",                
                tempFile: "=tempFile",
                error  : "=?error"
            },
            link: function($scope, $element, $attrs) {

                //==================================
                //
                //
                //==================================
                $scope.init = function() {

                    $scope.isImage = $attrs.hasOwnProperty('isImage');
                    $scope.$watch('files', function() {
                        if (!_.isEmpty($scope.files) && _.isArray($scope.files))
                            $scope.upload($scope.files);
                        if ($scope.files && !_.isArray($scope.files))
                            $scope.upload([$scope.files]);
                    });
                    $scope.$watch('file', function() {
                        if ($scope.file)
                            $scope.files = [$scope.file];
                    });
                }; // init

                //============================================================
                //
                //============================================================
                $scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                };

                //==================================
                //
                //
                //==================================
                $scope.delete = function(index) {

                    $scope.binding.splice(index, 1);

                }; // $scope.delete

                //==================================
                //
                //
                //==================================
                $scope.upload = function(files) {

                    if (files && files.length) {
                        if (!_.isArray($scope.binding)) $scope.binding = [];
                        if ($scope.tempFile) $scope.tempFile = {};

                        _.each(files, function(file) {
                            var pubDoc = {};

                            if (!file.$error && $attrs.schema &&  $attrs.docId){
                                mongoStorage.uploadDocAtt($attrs.schema, $attrs.docId, file).then(function(res) {

                                  pubDoc.src  = res.data.url;
                                  pubDoc.size = res.data.size;
                                  pubDoc.name = res.data.fileName;

                                  if ($scope.isImage)
                                      $scope.binding = pubDoc.src;
                                  else
                                      $scope.binding.push(pubDoc);
                                }).catch(function(err){$scope.error=err;});
                              }else if(!file.$error && $attrs.schema &&  !$attrs.docId ) {
                                mongoStorage.uploadTempFile($attrs.schema, file).then(function(response) {
                                  $scope.binding = response.data.url
                                }).catch(function(err){$scope.error=err;});
                            } else {
                                if(file.$error)
                                  $scope.error=file.$error;

                                if(!$attrs.schema )
                                  $scope.error={msg:"Error: you must specify a schema in order ot upload a document"};
                                  throw $scope.error;
                            }
                        });
                    }
                }; //upload


                $scope.init();
            }
        };
    }]);


});