define(['text!./edit-link.html', 'app', 'lodash', 'directives/on-file', 'ngSmoothScroll', ], function(template, app, _) {
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
    app.directive('editLink', ['$http', 'authentication', 'smoothScroll','devRouter', function($http, authentication, smoothScroll,devRouter) {
        return {
            restrict: 'E',
            template: template,
            replace: false,
            scope: {
                doc:       '=document',
                documents: '=links',
                save:      '&save',
                editIndex: '=index',
            },
            link: function($scope, $element, $attr) {

                if ($attr.name)
                    $scope.name = $attr.name;

                if ($attr.schema)
                    $scope.schema = $attr.schema;

                if (!$scope.documents)
                    $scope.documents = [];

            }, //link

            controller: ["$scope", function($scope) {

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
                    $scope.document.uri = isYoutubeWatchFix($scope.document.uri); // fix malformed youtube by user

                    var params={};
                    if(devRouter.isDev())
                      params.dev=true;

                    if($scope.doc._id)
                      params.docid=$scope.doc._id;

                    if ($scope.document.tempFile)
                        $http.get("/api/v2016/mongo-document-attachment/" + $scope.document.tempFile,  {
                            params:params
                        }).then(function() {
                            save();
                            delete($scope.document.tempFile);
                        }).catch(function(error) {
                            console.log(error);
                            $scope.error = error;
                            throw error;
                        });
                    else
                        save();

                } // saveLink
                $scope.saveLink = saveLink;

                //=======================================================================
                // saves doc to mongo
                //=======================================================================
                function save() {

                    if (!_.isNumber($scope.editIndex)) // if new put in array
                        $scope.documents.push($scope.document);

                    $scope.save().then(function() {
                        $scope.editIndex = false;
                    }).catch(function(error) {
                        console.log(error);
                        $scope.documents.pop();
                        $scope.error = error;
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
                    delete($scope.error);
                }
                $scope.close = close;

                //=======================================================================
                //
                //=======================================================================
                function upload(files,uri) {


                    _.each(files, function(file) {

                        authentication.getUser().then(function(res) {
                            $scope.user = res;
                            $scope.document[uri] = 'https://s3.amazonaws.com/mongo.document.attachments/'+$scope.schema+'/' + $scope.doc._id + '/' + encodeURI(file.name);
                            uploadDocAtt($scope.schema, $scope.doc._id, file);
                        });
                   });


                }
                $scope.upload = upload;

                //=======================================================================
                //
                //=======================================================================
                function uploadDocAtt(schema, _id, file) {
                    if (!schema) throw "Error: no schema set to upload attachment";
                    if (!_id) throw "Error: no docId set to upload attachment";
                    var postData = {
                        filename: encodeURI(file.name),
                        mongo:true,
                        //amazon messes with camel case and returns objects with hyphen in property name in accessible in JS
                        // hence no camalized and no hyphanized meta names
                        metadata: {
                            createdby: $scope.user.userID,
                            createdon: Date.now(),
                            schema: schema,
                            docid: _id,
                            filename: encodeURI(file.name),
                        }
                    };
                    return $http.post('/api/v2015/temporary-files', postData).then(function(res) {
                        // Create a temp file location to upload to
                        return res.data;
                    }).then(function(target) {
                        // upload file to temp area
                        return $http.put(target.url, file, {
                            headers: {
                                'Content-Type': target.contentType
                            }
                        }).then(function() {
                            $scope.document.tempFile = target.uid;
                        });
                    });

                } // uploadDocAtt


                //=======================================================================
                //
                //=======================================================================
                function findScrollFocus(id) {

                    var el = document.getElementById(id);

                    if (!$scope.focused) {

                        smoothScroll(el);
                        if ($(el).is("input") || $(el).is("select"))
                            el.focus();
                        else {
                            if ($(el).find('input').length === 0)
                                $(el).find('textarea').focus();
                            else
                                $(el).find('input').focus();

                        }
                    }
                } //
                $scope.findScrollFocus = findScrollFocus;
            }],
        }; // return
    }]); //app.directive('searchFilterCountries
}); // define