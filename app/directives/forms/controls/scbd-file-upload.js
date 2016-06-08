define(['app', 'lodash', 'text!./scbd-file-upload.html','filters/l-string'], function(app, _, template) {
    'use strict';
    app.directive('scbdFileUpload', ["$http", "Upload", "$timeout", 'mongoStorage','$sce', function($http, Upload, $timeout, mongoStorage,$sce) {
        return {
            restrict: 'E',
            template: template,
            transclude: false,
            scope: {
                binding: "=ngModal"
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

                        _.each(files, function(file) {
                            var pubDoc = {};


                            if (!file.$error)
                                mongoStorage.uploadDocAtt($attrs.schema, $attrs.docId, file).then(function() {
                                  pubDoc.src = 'https://s3.amazonaws.com/mongo.document.attachments' + '/' + $attrs.schema + '/' + $attrs.docId + '/' + file.name;
                                  pubDoc.size = file.size;
                                  pubDoc.name = file.name;
                                    if ($scope.isImage)
                                        $scope.binding = pubDoc.src;
                                    else
                                        $scope.binding.push(pubDoc);
                                });
                            else
                                throw file.$error;
                        });
                    }
                }; //upload

                $scope.init();
            }
        };
    }]);
    app.filter('fileSize', function() {
        return function(size) {
            if (size < 1024)
                return Math.ceil(size) + ' B';
            else if (size < 1048576)
                return Math.ceil((Number(size) / 1024)) + ' KB';
            else
              return Math.ceil((Number(size) / 1048576)) + ' MB';
        };
    });
});