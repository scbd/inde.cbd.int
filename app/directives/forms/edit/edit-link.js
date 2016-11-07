define(['text!./edit-link.html', 'app', 'lodash', 'directives/on-file', 'ngSmoothScroll','directives/on-focus-helper' ], function(template, app, _) {
    'use strict';


    app.directive('ngForm', function ($parse, $timeout) {
        return {
            link: linkFunction
        };

        function linkFunction ($scope, $element, $attrs) {

            var $submit_button = findSubmitButton();

            // bind Enter key
            $element.bind('keydown', function (e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) {
                    if ($attrs.ngSubmit) {
                        $parse($attrs.ngSubmit)($scope);
                        e.stopPropagation();
                    } else if ($submit_button) {
                        $submit_button.click();
                        e.stopPropagation();
                    }
                }
            });

            // bind Submit click to run itself or ngSubmit
            angular.element($submit_button).bind('click', function (e) {
                if ($attrs.ngSubmit && angular.element(this).attr('ng-click') === undefined) {
                    $parse($attrs.ngSubmit)($scope);
                    e.stopPropagation();

                    $timeout(function () {
                        if ($scope[$attrs.ngForm || $attrs.name]) {
                            $scope[$attrs.ngForm || $attrs.name].$submitted = true;
                        }
                        $element.addClass('ng-submitted');
                    });
                }
            });

            // internal
            function findSubmitButton () {
                var $buttons = [$element.find('button'), $element.find('input')];

                for (var i = 0; i < $buttons.length; i++) {
                    for (var n = 0; n < $buttons[i].length; n++) {
                        var $current = $buttons[i][n];
                        if ($current.getAttribute('type') && $current.getAttribute('type').toLowerCase() === 'submit') {
                            return $current;
                        }

                    }
                }
            }
        }

    });

    app.directive('onEnter', ['$parse', function ($parse) {
        return {
            link: function ($scope, $element, $attrs) {

                $element.bind('keyup', function (e) {

                    var keyCode = e.keyCode || e.which;

                    if (keyCode === 13 && $attrs.onEnter) {
                        $parse($attrs.onEnter)($scope);
                    }

                });
            }
        };
    }]);
    app.directive('editLink', ['$http', 'smoothScroll','devRouter', function($http, smoothScroll,devRouter) {
        return {
            restrict: 'E',
            template: template,
            replace: false,
            scope: {
                doc:       '=document',
                documents: '=links',
                save:      '&save',
                editIndex: '=index',
                onError: '&onError',
            },
            link: function($scope, $element, $attr) {

                if ($attr.name)
                    $scope.name = $attr.name;

                if ($attr.schema)
                    $scope.schema = $attr.schema;

                if($attr.hasFileUpload)
                    $scope.hasFileUpload = $attr.hasFileUpload;
                else
                    $scope.hasFileUpload = false;

                if($attr.fileTypes)
                    $scope.fileTypes = $attr.fileTypes;
                else
                    $scope.fileTypes = false;
                if (!$scope.documents)
                    $scope.documents = [];

            }, //link

            controller: ['$scope','mongoStorage','$element', function($scope,mongoStorage,$element) {

                $scope.$watch('editIndex', function() {
                    edit();
                });

                //=======================================================================
                //
                //=======================================================================
                function edit() {

                    if (_.isNumber($scope.editIndex))
                        $scope.document = $scope.documents[$scope.editIndex];
                    else
                        $scope.document = {};
                }

                //=======================================================================
                //
                //=======================================================================
                function saveLink() {

                    if ($scope.editLinkForm.title.$error.required )
                        findScrollFocus('title');

                    if (($scope.editLinkForm.uri.$error.required || !$scope.editLinkForm.uri.$valid))
                        findScrollFocus('linkUri');

                    if ($scope.editLinkForm.title.$valid && $scope.editLinkForm.uri.$valid ){
                        $scope.document.uri = isYoutubeWatchFix($scope.document.uri);
                        save();
                    }
                } // saveLink
                $scope.saveLink = saveLink;

                //=======================================================================
                // saves doc to mongo
                //=======================================================================
                function save() {
                    $scope.loading=true;

                    if (!_.isNumber($scope.editIndex)) // if new put in array
                        $scope.documents.push($scope.document);

                    return $scope.save().then(function() {
                        $scope.editIndex = false;
                        $scope.editLinkForm.$setPristine();
                        $scope.editLinkForm.$setValidity();
                        $scope.editLinkForm.$setUntouched();
                        $scope.document={};
                        var el = $element.find('#file');
                        el.value='';
                          $scope.focused=false;

                        $scope.loading=false;
                    }).catch(function(error) {
                        console.log(error);
                        $scope.onError(error);
                        $scope.documents.pop();
                        $scope.error = error;
                        $scope.loading=false;
                        throw error;
                    });
                }

                //=======================================================================
                //
                //=======================================================================
                function isYoutubeWatchFix(uri) {
                    if (!uri) return false;


                    var parser = document.createElement('a');
                    parser.href = uri;

                    if (parser.hostname.toLowerCase() === 'www.youtube.com' && parser.pathname === '/watch') {
                        return 'https://www.youtube.com/embed/' + getQueryVariable(parser.search, 'v');

                    } else {
                        return uri;
                    }

                } // saveLink
                $scope.isYoutubeWatchFix = isYoutubeWatchFix;

                //=======================================================================
                //
                //=======================================================================
                function getQueryVariable(search, variable) {
                    var query = search.substring(1);
                    var vars = query.split("&");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair[0] == variable) {
                            return pair[1];
                        }
                    }
                    return (false);
                }
                //=======================================================================
                //
                //=======================================================================
                function isNew() {

                    if (_.isBoolean($scope.editIndex) && $scope.editIndex)
                        return true;
                    else
                        return false;
                }
                $scope.isNew = isNew;

                //=======================================================================
                //
                //=======================================================================
                function close() {

                    $scope.editIndex = false;
                    $scope.document = {};
                    delete($scope.error);
                    delete($scope.mimeErrorTxt);
                }
                $scope.close = close;

function checkMime(file){
  if(!$scope.fileTypes) return true;
  if(file.type.indexOf($scope.fileTypes.slice(0, -2))>-1) return true;
  else
    return false;
}

function mimeError(file){
  if($scope.fileTypes.indexOf('image')>-1)
    $scope.mimeErrorTxt= "This file type is not supported.  Please upload an image file JPG, GIF, PNG or SVG";
  else
  $scope.mimeErrorTxt= "This file type is not supported.  Please upload a file type such as .bz2, .dtd, .doc, .docx, .dotx, .es  .html, .pdf, .potx, .ppsx, .ppt, .pptx, .ps, .txt, .xls, .xlsb, .xlsx, .xltx or .zip"
  $scope.uploading=false;
}

                //=======================================================================
                //
                //=======================================================================
                function upload(files,uri) {
                  $scope.uploading=true;

                    _.each(files, function(file) {
                            if(checkMime(file))
                            mongoStorage.uploadDocAtt($scope.schema, $scope.doc._id, file).then(function(){
                                      $scope.document[uri] = 'https://s3.amazonaws.com/mongo.document.attachments/'+$scope.schema+'/' + $scope.doc._id + '/' +  mongoStorage.awsFileNameFix(file.name);
                                      $scope.uploading=false;
                            }).catch($scope.onError);
                            else mimeError(file);
                   });
                }
                $scope.upload = upload;



                //=======================================================================
                //
                //=======================================================================
                function findScrollFocus(id) {

                    var el = document.getElementById(id);

                    if (!$scope.focused) {
                        smoothScroll(el); /// angular element does not work with smooth scroll
                        $element.find('#'+id).focus(); // focus would not work with element from document
                        $scope.focused=true;
                    }

                } //
                $scope.findScrollFocus = findScrollFocus;
            }],
        }; // return
    }]); //app.directive('searchFilterCountries
}); // define